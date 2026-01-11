#!/usr/bin/perl
#
# Package that provides an interface to the get_iplayer script.
#
# History
#
# Date       Who     Change
# ----       ---     ------
# 11-Jan-26  Rhob    Exit if failed to get programs from API.
# 22-Mar-25  Rhob    Update MP3 info in two stages. Second one is just the image.
# 01-Jan-23  Rhob    Comment the internal packages.
# 31-Dec-22  Rhob    Move config to a separate package.
# 30-Dec-22  Rhob    Generate accessors.
# 23-Dec-22  Rhob    Output raw files and MP3s to different directories.
#                    Reorganise and add comments.
# 29-Jun-17  Rhob    Add remote web support.
# 21-Jun-17  Rhob    Tidy up web download support.
# 09-Jun-17  Rhob    Add support for web download.
# 15-May-17  Rhob    Updated to gip 3.0. New download modes.
# 01-Nov-14  Rhob    Updated to download by PID only. BBC removed the index feeds.
# 31-Jul-10  Rhob    Created
#
#
# NOTES
# Setting the thumbnail in the MP3 file will only work if the associated Perl MP3::Tag package has been hacked;
# see https://wiki.rhobweb.com/get_iplayer
################################################################################

package RhobGetIPlayerUtils;

use strict;
use warnings;
use lib "$ENV{HOME}/PerlLib";
use lib "$ENV{HOME}/.rhob_gip";
use File::Basename;
use File::Fetch;
use Cwd;
use JSON;
use URI;
use HTTP::Request;
use Data::Dumper;
use RhobFileUtils;
use RhobGipConfig;

##################################################################################################
# RhobGipConfig
# =============
#
# Mandatory Configuration:
#
# GETIPLAYERHOME                : Pathname of the directory in which get_iplayer is installed, usually "/usr/bin" or "/cygdrive/c/Program Files/get_iplayer";
# GETIPLAYER                    : Pathname of the get_iplayer executable, usually "${GETIPLAYERHOME}/get_iplayer.cmd";
# GETIPLAYER_FFMPEG             : Pathname of ffmpeg utility to process the raw audio files, usually "/usr/bin/ffmpeg" or "${GETIPLAYERHOME}/utils/bin/ffmpeg.exe";
# GETIPLAYER_OUTPUT             : Pathname of the directory into which get_iplayer outputs raw audio and thumbnail files;
# GETIPLAYER_OUTPUT_MP3         : Pathname of the directory into which MP3 files are to be output;
# GETIPLAYER_MP3INFO            : Pathname of the utility to update the MP3 tags;
# GETIPLAYERUSERPREFS           : Pathname of the directory into which get_iplayer writes the download history file;
# GIP_DOWNLOAD_HISTORY_BASENAME : basename of the get_iplayer download history file, usuaully "download_history"; 
# GIP_RADIO_CACHE_BASENAME      : basename of the get_iplayer program content cache, usually "radio.cache";
# GIP_FILENAME_DISCRIMINATOR    : text used along with a number to discriminate between multiple versions of the same file, e.g., "_Renamed_" => "MyFile_Renamed_02.mp3";
# GIP_LOCAL_DIR_URI             : URI to the local website where the required program list is specified;
# GIP_REMOTE_DIR_URI            : URI to the remote website where the required program list is specified;
# GIP_PROGS_BASENAME            : basename of the webpage containing the required program list;
# GIP_RESULTS_BASENAME          : basename of the webpage to which the results of the download should be posted;
#
# Optional configuration:
#
# GIP_AUDIO_MODE_ARGS_NORMAL    : the get_iplayer normal audio modes to search for in order of preference;
# GIP_AUDIO_MODE_ARGS_HIGH      : the get_iplayer high quality audio modes to search for in order of preference;
# GIP_DEFAULT_ARTIST            : the default MP3 "Artist" tag to set;
# GIP_DEFAULT_ALBUM_ARTIST      : the default MP3 "Album Artist" tag to set;
# GIP_DEFAULT_ALBUM             : the default MP3 "Album" tag to set.
#
##################################################################################################

##################################################################################################
# Packages in the file
#
# GipOptions          : parses the command line options and provides accessors for each options;
# DownloadHistoryItem : parses an entry in the get_iplayer download history and provides accessors for some of the properties;
# DownloadHistory     : parses the get_iplayer download history and create a set of DownloadHistoryItem objects;
# InputDataItem       : holds the data for a requested program item and provides accessors to the values, e.g., pid, basename, quality;
# InputData           : parses the requested program data and creates a set of InputDataItem objects;
# FoundDataItem       : holds the data for a program item during the download process and provides accessors for the properties, e.g., pathname, thumbnail;
# FoundData           : holds the data for the program items to be downloaded as a set of FoundDataItem objects;
# WebProgs            : calls the Web interface to get the requested program data and to post the results of the download;
# MP3Item             : converts a raw audio file to MP3 format and updates the tags;
# DownloadFilesItem   : calls get_iplayer to download the requested item in raw audio format;
# DownloadFiles       : holds a set of DownloadFilesItem objects and processes the raw audio files to generate MP3s with tags.
##################################################################################################

BEGIN {
  use Exporter   ();
  our ($VERSION, @ISA, @EXPORT, @EXPORT_OK, %EXPORT_TAGS); 

  # set the version for version checking
  $VERSION     = 1.01;

  @ISA         = qw(Exporter);
  @EXPORT      = qw();
  %EXPORT_TAGS = ( );     # eg: TAG => [ qw!name1 name2! ],

  # your exported package globals go here,
  # as well as any optionally exported functions
  @EXPORT_OK   = qw( );
}

##################################
# exported package globals go here

######################################
# non-exported package globals go here

our $IS_WINDOWS = &RhobFileUtils::IsWindows();

######################################
# Some OS utilities
sub convertToWindowsPathname {
  my $rawPathname = $_[0];
  my $cookedPathname;
  if ( $IS_WINDOWS ) {
    $cookedPathname = &RhobFileUtils::Cygwin2WinPath( $rawPathname );
  } else {
    $cookedPathname = $rawPathname;
  }
  return $cookedPathname;
}

sub convertToUnixPathname {
  my $rawPathname = $_[0];
  my $cookedPathname;
  if ( $IS_WINDOWS ) {
    $cookedPathname = &RhobFileUtils::Win2CygwinPath( $rawPathname );
  } else {
    $cookedPathname = $rawPathname;
  }
  return $cookedPathname;
}

# Default values
#
#our $DEFAULT_GIP_AUDIO_MODE_ARGS_NORMAL = "radiogood,radioworst,hafmed,haflow,hafstd,radiostd,radiolow"; # TODO: Old
our $DEFAULT_GIP_AUDIO_MODE_ARGS_NORMAL = "med,std,low";
#our $DEFAULT_GIP_AUDIO_MODE_ARGS_HIGH   = "hafhigh,hafmed,haflow,hafstd,radiobest,radiobetter"; # TODO: Old
our $DEFAULT_GIP_AUDIO_MODE_ARGS_HIGH   = "high,med,low,std";

# get_iplayer configuration
our $GETIPLAYERHOME                = $RhobGipConfig::GETIPLAYERHOME       || die("GETIPLAYERHOME not defined"); # UNIX pathname to the directory in which get_iplayer is installed
our $GETIPLAYER                    = $RhobGipConfig::GETIPLAYER           || die("GETIPLAYER not defined");
our $GETIPLAYER_FFMPEG             = $RhobGipConfig::GETIPLAYER_FFMPEG    || die("GETIPLAYER_FFMPEG not defined"); # UNIX pathname to ffmpeg utility to process the raw audio files
die("GETIPLAYER_OUTPUT not defined") unless defined($RhobGipConfig::GETIPLAYER_OUTPUT);
our $GETIPLAYER_OUTPUT             = &convertToWindowsPathname($RhobGipConfig::GETIPLAYER_OUTPUT);
die("GETIPLAYER_OUTPUT_MP3 not defined") unless defined($RhobGipConfig::GETIPLAYER_OUTPUT_MP3);
our $GETIPLAYER_OUTPUT_MP3         = &convertToWindowsPathname($RhobGipConfig::GETIPLAYER_OUTPUT_MP3); # Pathname to the directory into which ffmpeg is to write MP3s
our $GETIPLAYER_MP3INFO            = $RhobGipConfig::GETIPLAYER_MP3INFO   || die("GETIPLAYER_MP3INFO not defined");

# get_iplayer file definitions
die("GETIPLAYERUSERPREFS not defined") unless defined($RhobGipConfig::GETIPLAYERUSERPREFS);
our $GETIPLAYERUSERPREFS           = &convertToWindowsPathname($RhobGipConfig::GETIPLAYERUSERPREFS);
our $GIP_LOG_DIR                   = $GETIPLAYERUSERPREFS;
our $GIP_CACHE_DIR                 = $GIP_LOG_DIR;
our $GIP_DOWNLOAD_HISTORY_DIR      = $GIP_LOG_DIR;
our $GIP_DOWNLOAD_HISTORY_BASENAME = $RhobGipConfig::GIP_DOWNLOAD_HISTORY_BASENAME || die("GIP_DOWNLOAD_HISTORY_BASENAME not defined");
our $GIP_DOWNLOAD_HISTORY_PATHNAME = &RhobFileUtils::FixPath($GIP_DOWNLOAD_HISTORY_DIR, $GIP_DOWNLOAD_HISTORY_BASENAME);
our $GIP_RADIO_CACHE_BASENAME      = $RhobGipConfig::GIP_RADIO_CACHE_BASENAME      || die("GIP_RADIO_CACHE_BASENAME not defined");
our $GIP_RADIO_CACHE_PATHNAME      = &RhobFileUtils::FixPath($GIP_CACHE_DIR,            $GIP_RADIO_CACHE_BASENAME);

our $GIP_AUDIO_MODE_ARGS_NORMAL    = $RhobGipConfig::GIP_AUDIO_MODE_ARGS_NORMAL || $DEFAULT_GIP_AUDIO_MODE_ARGS_NORMAL;
our $GIP_AUDIO_MODE_ARGS_HIGH      = $RhobGipConfig::GIP_AUDIO_MODE_ARGS_HIGH   || $DEFAULT_GIP_AUDIO_MODE_ARGS_HIGH;
# Duplicate .mp3 filenames are discriminated by appending with this and a number.
# e.g., myfile.mp3 -> myfile_disriminator_01.mp3
our $GIP_FILENAME_DISCRIMINATOR    = $RhobGipConfig::GIP_FILENAME_DISCRIMINATOR || die("GIP_FILENAME_DISCRIMINATOR");

# GIP Utility config
our $GIP_LOCAL_DIR_URI              = $RhobGipConfig::GIP_LOCAL_DIR_URI    || die("GIP_LOCAL_DIR_URI not defined");
our $GIP_REMOTE_DIR_URI             = $RhobGipConfig::GIP_REMOTE_DIR_URI   || die("GIP_REMOTE_DIR_URI not defined");
our $GIP_PROGS_BASENAME             = $RhobGipConfig::GIP_PROGS_BASENAME   || die("GIP_PROGS_BASENAME not defined"); # URI basename that gets the requested programs to be downloaded
our $GIP_RESULTS_BASENAME           = $RhobGipConfig::GIP_RESULTS_BASENAME || die("GIP_RESULTS_BASENAME not defined");

# All MP3s are created with these defaults
our $GIP_DEFAULT_ARTIST            = $RhobGipConfig::GIP_DEFAULT_ARTIST        || q||;
our $GIP_DEFAULT_ALBUM_ARTIST      = $RhobGipConfig::GIP_DEFAULT_ALBUM_ARTIST  || q||;
our $GIP_DEFAULT_ALBUM             = $RhobGipConfig::GIP_DEFAULT_ALBUM         || q||;

# The config variables to list
our @ARR_CONFIG = qw|GETIPLAYERHOME GETIPLAYER GETIPLAYER_FFMPEG GETIPLAYER_OUTPUT GETIPLAYER_OUTPUT_MP3 GETIPLAYERUSERPREFS GETIPLAYER_MP3INFO GIP_DOWNLOAD_HISTORY_BASENAME GIP_RADIO_CACHE_BASENAME GIP_LOCAL_DIR_URI GIP_REMOTE_DIR_URI GIP_PROGS_BASENAME GIP_RESULTS_BASENAME GIP_AUDIO_MODE_ARGS_NORMAL GIP_AUDIO_MODE_ARGS_HIGH GIP_DEFAULT_ARTIST GIP_DEFAULT_ALBUM_ARTIST GIP_DEFAULT_ALBUM GIP_FILENAME_DISCRIMINATOR|;
map { $_ = __PACKAGE__ . q|::| . $_ } @ARR_CONFIG; # Prepend the package to each variable name

# The environment variables required by get_iplayer
our @ARR_GETIPLAYER_ENV = qw|GETIPLAYERHOME GETIPLAYER GETIPLAYER_OUTPUT GETIPLAYERUSERPREFS|; # The environment variables required by get_iplayer
our %HSH_GETIPLAYER_ENV = (); # Generate a hash of the required environment variables
foreach my $env ( @ARR_GETIPLAYER_ENV ) {
  no strict 'refs';
  $HSH_GETIPLAYER_ENV{$env} = ${$env};
}

#
my $MP3_SUFFIX           = q|.mp3|;

# all file-scoped lexicals must be created before
# the functions below that use them.

my $ourGenreComedy          = q|Comedy|;
my $ourGenreBooksAndSpoken  = q|Books & Spoken|;
my $DEFAULT_GENRE           = $ourGenreComedy;
# Was 128 Kb/s prior to v3.0, but hafmed is only 96 Kb/s 
my $mp3BitsPerSecondDefault = q|96000|;
my $mp3BitsPerSecondHigh    = q|322000|;

# file-private lexicals go here

my $ourExactMatch              = 1;
my $ourNotExactMatch           = 0;

my $RESULT_UNKNOWN             = q|UNKNOWN|;
my $RESULT_ERROR               = q|ERROR|;
my $RESULT_NOT_DOWNLOADED      = q|NOT DOWNLOADED|;
my $RESULT_DOWNLOADED          = q|DOWNLOADED|;
my $RESULT_ALREADY_DOWNLOADED  = q|ALREADY DOWNLOADED|;

my $FILE_DOES_NOT_EXIST        = q|DOES NOT EXIST|;
my $FILE_EXISTS                = q|EXISTS|;

my $QUALITY_NORM               = q|Norm|;
my $QUALITY_HIGH               = q|High|;

####################################################
# Name:        genAccessors
# Description: create accessor functions for the class.
#              If the "created" property is not set, creates a method for each property name that:
#               - if called without arguments returns the value;
#               - if called with an argument sets the value to that argument.
# @param $class:           the class name.
# @param $refHshAccessors: hash ref with properties:
#                           - created: 0 if need to create the accessors, 1 if the accessors have already been created;
#                                      this gets set to 1 by this function;
#                           - props:   array ref to the required property names;
sub genAccessors() {
  my ( $class, $refHshAccessors ) = @_;
  my $bCreated = ${$refHshAccessors}{created};
  if ( ! $bCreated ) {
    no strict 'refs';
    my $refArrProp = ${$refHshAccessors}{props};
    foreach my $prop ( @{$refArrProp} ) {
      my $propAttr = "_$prop";
      *{"${class}::${prop}"} = sub {
        my ( $self, $newValue ) = @_;
        if ( defined($newValue) ) {
          $self->{$propAttr} = $newValue;
        }
        return $self->{$propAttr};
      }
    }
    ${$refHshAccessors}{created} = 1;
  }
}

########################################################################################################################
# Name:        RunGipCmd
# Description: Run a get_iplayer command from the get_iplayer installation directory.
sub RunGipCmd {
  my ( $cmd ) = @_;
  my $gipHome = $GETIPLAYERHOME;
  my $oldDir  = getcwd;

  chdir( $gipHome );
  system( $cmd );
  chdir( $oldDir );
}

########################################################################################################################
# Name:        IsHighQuality
# Description: Determine whether the audio quality is Normal or High.
# @param 0   : the audio quality value.
# @return 1 if the parameter matches case insensitive 'HIGH', 0 otherwise.
sub IsHighQuality {
  my ( $value )    = @_;
  my $bHighQuality = 0;

  if ( $value =~ m|^$QUALITY_HIGH$|i ) {
    $bHighQuality = 1;
  }

  return $bHighQuality;
}

########################################################################################################################
# package:    GipOptions
# Properties: currentdayinclude - if set include programs that match the current day, e.g., Mon;
#             nodownload        - do not download the program, just process the downloaded program;
#             force             - download the program even if it has previously been downloaded;
#             overwrite         - tell get_iplayer to overwrite any previously downloaded file (default is to keep it and indicate success);
#             remote            - get the programs to download from the remote website;
#             weburi            - the URI of the programs to download (automatically set according to the 'remote' option;
#             print             - print out the options;
#             verbosity         - the verbosity level;
#             gipargs           - arguments passed directly to get_iplayer.
{
  package GipOptions;

  our %ourHshAccessors = (
    props   => [ qw( nodownload force overwrite currentdayinclude remote weburi print verbosity gipargs ) ],
    created => 0,
   );

  sub new {
    my ( $class ) = @_;
    my $self = {};
    bless $self, $class;
    &RhobGetIPlayerUtils::genAccessors( $class, \%ourHshAccessors );
    $self->processArguments();
    return $self;
  }

  sub printConfig { # Print out the configuration used by the script
    my ( $self ) = @_;

    foreach my $configItemName ( @RhobGetIPlayerUtils::ARR_CONFIG ) {
      no strict 'refs';
      my $configItem = ${$configItemName};
      printf( "CONFIG: %-50s = %s\n", $configItemName, $configItem );
    }
  }

  sub usage {
    my ( $self ) = @_;
    print <<EOT
Usage: $0 [--nodownload] [--currentdayinclude] [--remote]
        [-print] [--force] [--verbosity=<level>] [--help]
Where:
  --nodownload        : do not download the files, just process them.
                        Only programs be marked as "OK" will be processed.
  --currentdayinclude : attempt to download files that are marked for the current day.
                        Default is process up to yesterday.
  --remote            : Get the programs from rhoweb.com, otherwise get them from rhob-pc.
  --print             : Just print out the files to be downloaded.
  --force             : Force getiplayer to download programs that it has previously donwloaded.
  --verbosity=<level> : Set the verboisity level for debug purposes.
  --help              : Print this message and exit.
EOT
;
  }

  sub processArguments {
    use Getopt::Long;
    my ( $self )          = @_;
    my %hshArgs           = ();
    my $get               = 0;
    my $search            = 0;
    my $force             = 0; 
    my $overwrite         = 0; 
    my $verbosity         = 0;
    my $refresh           = 0;
    my $nodownload        = 0;
    my $remote            = 0; # Download from rhoweb.com
    my $currentDayInclude = 0;
    my $print             = 0; # Just print out the files to be downloaded
    my $gipArgs           = ''; # Additional arguments
    my $result;
    my $webURI;
    my $bHelp             = 0;
  
    $result = &GetOptions(
      "nodownload"         => \$nodownload,
      "currentdayinclude"  => \$currentDayInclude,
      "remote"             => \$remote,
      "print"              => \$print,
      "force"              => \$force,
      "overwrite"          => \$overwrite,
      "verbosity=i"        => \$verbosity,
      "help"               => \$bHelp,
    );
  
    if ($bHelp) {
      $self->usage();
      exit(0);
    }
  
    die("Invalid arguments") unless $result;
  
    if ( $nodownload ) {
      $force = 1;
    }
  
    if ($remote) {
      $webURI = $GIP_REMOTE_DIR_URI;
    } else {
      $webURI = $GIP_LOCAL_DIR_URI;
    }
  
    $self->nodownload( $nodownload );
    $self->force( $force );
    $self->overwrite( $overwrite );
    $self->currentdayinclude( $currentDayInclude );
    $self->remote( $remote );
    $self->weburi( $webURI );
    $self->print( $print );
    $self->verbosity( $verbosity );
  
    $gipArgs .= " --thumb"; # Always download the thumbnail.
  
    if ( $verbosity >= 5 ) {
      $gipArgs .= " --verbose";
    }
  
    $self->gipargs( $gipArgs );
  
    $self->printConfig() if ( $verbosity > 2 );
  }

  1;
}

##################################################################################################
# package:     DownloadHistoryItem class
# Description: Parse a get_iplayer history item and provide accessors for the properties.
{
  package DownloadHistoryItem;

  our %ourHshAccessors = (
    props   => [ qw( pid pathname title description thumbnail ) ],
    created => 0,
   );

  #########################################
  # @param : 0 (IN) the name of this class.
  # @param : 1 (IN) a line from the get_iplayer download history file.
  sub new {
    my $class          = shift;
    my $rawHistoryLine = shift;
    my $self           = {};
    bless $self, $class;
    &RhobGetIPlayerUtils::genAccessors( $class, \%ourHshAccessors );

    if ( $rawHistoryLine =~ m/^([^#].*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|/ ) {
      my %historyEntry;
      my $pid         = $1;  # The PID
      my $title       = $3;  # The title
      my $pathname    = $7;  # The downloaded pathname
      my $description = $10; # Program description text
      my $thumbnail   = $13; # URI of the associated image
      $self->pid( $pid );
      $self->pathname( $pathname );
      $self->title( $title );
      $self->description( $description );
      $self->thumbnail( $thumbnail );
    }
    return $self;
  }

  1;
}

##################################################################################################
# package:      DownloadHistory
# Descripation: Read in the get_iplayer download history file and provide access by PID.
#
{
  package DownloadHistory;

  import DownloadHistoryItem;

  our $ourInstance                = undef;
  our $ourDirty                   = 1;
  our $ourDownloadHistoryPathname = $GIP_DOWNLOAD_HISTORY_PATHNAME;

  #########################################
  # @param : 0 (IN) the name of this class.
  # @param : 1 (IN) the verbosity level.
  sub new {
    my ( $class, $verbosity ) = @_;

    if ( ( ! $ourInstance ) || $ourDirty ) {
      my $self = {};
      bless $self, $class;
      $self->loadFile( $verbosity );
      $ourInstance = $self;
      $ourDirty    = 0;
    }

    return $ourInstance;
  }

  sub loadFile {
    my ( $self, $verbosity ) = @_;
    my $fd;
    my $line;

    #open($fd, "< $ourDownloadHistoryPathname") or die("Uanble to open download history file:$ourDownloadHistoryPathname$!");
    if ( open($fd, "< $ourDownloadHistoryPathname") ) {

      while ( <$fd> ) {
        chomp; # Remove the trailing carriage return from the Windows format file
        $line = $_;
        my $historyItem = new DownloadHistoryItem( $line );
        $self->setItem( $historyItem );
      }
    } else {
      # Warn, as for a first time install the history file will not be present
      print("Uanble to open download history file:$ourDownloadHistoryPathname$!");
    }
    $self->setClean();
  }

  sub setItem {
    my ( $self, $historyItem ) = @_;
    my $pid = $historyItem->pid();
    $self->{$pid} = $historyItem;
  }

  sub getItem {
    my ( $self, $pid ) = @_;
    return $self->{$pid};
  }

  sub setDirty {
    my ( $self ) = @_;
    $ourDirty = 1;
  }

  sub setClean {
    my ( $self ) = @_;
    $ourDirty = 0;
  }

  1;
}

########################################################################################################################
# package:     InputDataItem
# Description: Holds the data for a requested program item and provides accessors to the values, e.g., pid, basename, quality;
{
  package InputDataItem;

  our %ourHshAccessors = (
    props   => [ qw( pid seqnum basename ) ], # genre and quality are special cases
    created => 0,
   );

  sub new {
    my ( $class, $refRawItem, $seqNum, $verbosity ) = @_;
    my $self = {};
    bless $self, $class;
    &RhobGetIPlayerUtils::genAccessors( $class, \%ourHshAccessors );
    $self->initItem( $refRawItem, $seqNum );
    return $self;
  }

  sub initItem {
    my ( $self, $refRawItem, $seqNum ) = @_;
    my ( $pid, $basename, $genre, $quality ) = @{$refRawItem};
    $self->seqnum( $seqNum );
    $self->pid( $pid);
    $self->genre( $genre );
    $self->basename( $basename );
    $self->quality( $quality );
  }

  sub genre {
    my ( $self, $value ) = @_;
    if ( defined( $value ) ) {
      $self->{_genre} = $self->calcGenre( $value );
    }
    return $self->{_genre};
  }

  sub quality {
    my ( $self, $value ) = @_;
    if ( defined( $value ) ) {
      if ( &RhobGetIPlayerUtils::IsHighQuality( $value ) ) {
        $value = $QUALITY_HIGH;
      } else {
        $value = $QUALITY_NORM;
      }
      $self->{_quality} = $value;
    }
    return $self->{_quality};
  }

  sub calcGenre {
    my ( $self, $genre ) = @_;

    if ($genre eq '' ) {
      $genre = $DEFAULT_GENRE;
    #} elsif ( $genre ne $ourGenreComedy ) {
    #  $genre = $ourGenreBooksAndSpoken;
    }
    return $genre;
  }

  sub print {
    my ( $self ) = @_;
    my $pid          = $self->pid();
    my $genre        = $self->genre();
    my $audioQuality = $self->quality(); # ? "High" : "Norm" );
    my $basename     = $self->basename();
    printf("%8s, %1s, %4s, \"%s\"\n", $pid, $genre, $audioQuality, $basename);
  }

  1;
}

########################################################################################################################
# package:     InputData
# Description: Parses the requested program data and creates a set of InputDataItem objects;
{
  package InputData;

  sub new {
    my ( $class, $refRawInputData, $verbosity ) = @_;
    my $self = {
      items => {},
    };
    bless $self, $class;
    $self->init( $refRawInputData, $verbosity );
    return $self;
  }

  sub init {
    my ( $self, $refRawInputData, $verbosity ) = @_;
    my $seqNum = 0;
    foreach my $rawItem ( @{$refRawInputData} ) {
      my $item = new InputDataItem( $rawItem, $seqNum, $verbosity );
      ${$self->{items}}{$seqNum} = $item;
      $seqNum++;
    }
  }

  sub print {
    my ( $self ) = @_;
    foreach my $key ( keys %{$self->{items}} ) {
      my $item = $self->getItem( $key );
      $item->print();
    }
  }

  sub getCount {
    my ( $self ) = @_;
    return keys %{$self->{items}};
  }

  sub getItem {
    my ( $self, $seqNum ) = @_;
    return ${$self->{items}}{$seqNum};
  }

}

########################################################################################################################
# package:     FoundDataItem
# Description: Holds the data for a program item during the download process and provides accessors for the properties:
#               - pid          - the PID;
#               - seqnum       - the input sequence number, this is a base 0 index of the programs in the order they appear in the GIP utility;
#               - basename     - the requested file filename part (possibly updated due to clashes);
#               - origbasename - original requested file basename;
#               - quality      - 'High' or 'Norm' (case insensitive);
#               - pathname     - the downloaded Windows pathname;
#               - genre        - Genre, one of: "Books & Spoken", "Comedy";
#               - downloaded   - 1 if already downloaded, 0 otherwise;
#               - result       - 1 if successful, 0 otherwise;
#               - title        - the program title;
#               - description  - the program description;
#               - thumbnail    - the program thumbnail URI;
#               - artist       - the program artist;
#               - albumartist  - the program album artist;
#               - album        - the program album.
{
  package FoundDataItem;

  our %ourHshAccessors = (
    props   => [ qw( pid seqnum basename origbasename quality genre title description thumbnail result downloaded pathname artist albumartist album ) ],
    created => 0,
   );

  sub new {
    my ( $class, $objInputItem, $verbosity ) = @_;
    my $self = {
      _defaultartist      => $GIP_DEFAULT_ARTIST,
      _defaultalbumartist => $GIP_DEFAULT_ALBUM_ARTIST,
      _defaultalbum       => $GIP_DEFAULT_ALBUM,
    };
    bless $self, $class;
    &RhobGetIPlayerUtils::genAccessors( $class, \%ourHshAccessors );
    $self->init( $objInputItem );
    return $self;
  }

  sub init {
    my ( $self, $objInputItem ) = @_;
    $self->pid( $objInputItem->pid() );
    $self->seqnum( $objInputItem->seqnum() );
    $self->basename( $objInputItem->basename() );
    $self->origbasename( $objInputItem->basename() );
    $self->genre( $objInputItem->genre() );
    $self->quality( $objInputItem->quality() );
    $self->title( q|| );
    $self->description( q|| );
    $self->thumbnail( q|| );
    $self->result( $RESULT_UNKNOWN );
    $self->downloaded( 0 );
    $self->pathname( q|| );
    $self->artist( $self->{_defaultartist} );
    $self->albumartist( $self->{_defaultalbumartist} );
    $self->album( $self->{_defaultalbum} );
  }

  sub print {
    my ( $self, $verbosity ) = @_;
    my $pid          = $self->pid();
    my $origBasename = $self->origbasename();
    if ( $self->downloaded() ) {
      print("****** Already downloaded: $pid : $origBasename\n");
    } else {
      print("$pid - $origBasename\n");
    }
  }

  sub printDownloadResult {
    my ( $self ) = @_;
    my $pid          = $self->pid();
    my $pathname     = $self->pathname();
    my $origBasename = $self->origbasename();
    my $result       = $self->result();

    if ( $RESULT_DOWNLOADED eq $result ) {
      print("SUCCESS: $pid : $origBasename : $pathname\n");
    } elsif ( $RESULT_ALREADY_DOWNLOADED eq $result ) {
      print("ALREADY DOWNLOADED: $pid : $origBasename\n");
    } else {
      print("FAILED : $pid : $origBasename : $result\n");
    }
  }

  sub getOutputPathname {
    my ( $self, $verbosity ) = @_;
    my $suffix               = $MP3_SUFFIX;
    my $basename             = $self->basename();
    my $i                    = 0;
    my $filename             = q||;
    my $pathname             = q||;
    my $descriminator        = q||;

    while ( length($pathname) == 0 ) {
      $filename = $basename . $descriminator . $suffix;

      $pathname = &RhobFileUtils::FixPath( $GETIPLAYER_OUTPUT_MP3, $filename );

      if ( -r "$pathname" ) {
        print( "Warning:Output Pathname already exists, will rename:\n$pathname\n" );
        $pathname = "";
        $i++;
        $descriminator = sprintf( $GIP_FILENAME_DISCRIMINATOR . "%02d", $i );
        # Set verbosity flag so that the actual generated pathname is displayed
        if (!$verbosity) { $verbosity = 1; }
      }
    }

    print("Index:$i Output Pathname:\n$pathname\n") if ($verbosity > 0);

    return $pathname;
  }

  sub calcDownloadResult {
    my ( $self, $fileStatus ) = @_;
    if ( $fileStatus eq $FILE_EXISTS ) { # If already downloaded
      if ( $self->result() eq $RESULT_UNKNOWN ) {
        $self->result( $RESULT_ALREADY_DOWNLOADED );
      } else {
        $self->result( $RESULT_DOWNLOADED );
      }
      $self->downloaded( 1 );
    } else { # Downloaded file does not exists
      $self->result( $RESULT_NOT_DOWNLOADED );
      $self->downloaded( 0 );
    }
  }

  1;
}

########################################################################################################################
# package:     FoundData
# Description: Holds the data for the program items to be downloaded as a set of FoundDataItem objects.
#              Provide accessors by PID and sequence number.
{
  package FoundData;

  import InputData;
  import FoundDataItem;
  import DownloadHistory;

  sub new {
    my ( $class, $objOptions, $objInputData ) = @_;
    my $self = {
      items => {},
    };
    bless $self, $class;
    my $verbosity = $objOptions->verbosity();

    for ( my $seqNum = 0; $seqNum < $objInputData->getCount(); ++$seqNum ) {
      my $objInputDataItem = $objInputData->getItem( $seqNum );
      my $foundDataItem    = new FoundDataItem( $objInputDataItem, $verbosity );
      my $pid              = $foundDataItem->pid();
      die("Duplicate PID in input data: $pid") if ( defined($self->{$pid}) );
      ${$self->{items}}{$pid} = $foundDataItem;
    }

    $self->updateFromHistory( $verbosity );

    $self->print( $verbosity ) if ( $verbosity > 0 );

    return $self;
  }

  sub getItem {
    my ( $self, $pid, $verbosity ) = @_;
    return ${$self->items}{$pid};
  }

  sub getNumItems {
    my ( $self ) = @_;
    my $numItems = keys( %{$self->{items}} );
    return $numItems;
  }

  sub getItemBySeqNum {
    my ( $self, $seqNum, $verbosity ) = @_;
    my @arrPID = $self->getOrderedPIDs();
    my $pid    = $arrPID[ $seqNum ] || q|0|;
    return ${$self->{items}}{$pid};
  }

  sub updateFromHistory {
    my ( $self, $verbosity ) = @_;
    my $objDownloadHistory = new DownloadHistory( $verbosity );
    foreach my $item ( values(%{$self->{items}}) ) {
      my $pid            = $item->pid();
      my $objHistoryItem = $objDownloadHistory->getItem($pid);
      if ( defined($objHistoryItem) ) {
        my $itemPathname = $objHistoryItem->pathname();
        $item->pathname( $itemPathname );
        $item->title( $objHistoryItem->title() );
        $item->description( $objHistoryItem->description() );
        $item->thumbnail( $objHistoryItem->thumbnail() );
        my $rawFile = &RhobGetIPlayerUtils::convertToUnixPathname( $itemPathname );
        if ( -r "$rawFile" ) {
          $item->calcDownloadResult( $FILE_EXISTS );
        } else {
          $item->calcDownloadResult( $FILE_DOES_NOT_EXIST );
        }
      } else {
        $item->pathname(    "" );
        $item->title(       "" );
        $item->description( "" );
        $item->thumbnail(   "" );
        $item->calcDownloadResult( $FILE_DOES_NOT_EXIST );
      }
    }
  }

  sub getOrderedPIDs {
    my ( $self ) = @_;
    my @arrPID = ();
    foreach my $pid ( keys(%{$self->{items}}) ) {
      my $item   = ${$self->{items}}{$pid};
      my $seqNum = $item->seqnum(); 
      $arrPID[ $seqNum ] = $pid;
    }
    return @arrPID;
  }

  sub anythingToDownload {
    my ( $self, $bForce, $verbosity ) = @_;
    my $bAnyToDownload = 0;

    if ( $bForce ) {
      $bAnyToDownload = 1;
    } else {
      foreach my $item ( values(%{$self->{items}}) ) {
        if ( $item->downloaded() ) {
          my $pid = $item->pid();
          print("Item already in download history:$pid\n") if ( $verbosity > 1 );
        } else {
          $bAnyToDownload = 1;
        }
      }
    } 
    return $bAnyToDownload;
  }

  sub print {
    my ( $self, $verbosity ) = @_;
    my @arrPID = $self->getOrderedPIDs();
    foreach my $pid ( @arrPID ) {
      my $item = ${$self->{items}}{$pid};
      $item->print( $verbosity );
    } 
  }

  sub printDownloadResults {
    my ( $self, $verbosity ) = @_;
    my @arrPID = $self->getOrderedPIDs();
    foreach my $pid ( @arrPID ) {
      my $item = ${$self->{items}}{$pid};
      $item->printDownloadResult( $verbosity );
    } 
  }

  1;
}

########################################################################################################################
# package:     WebProgs
# Description: Calls the Web interface to get the requested program data and to post the results of the download.
{
  package WebProgs;

  import ImportData;
  import GipOptions;
  use LWP::UserAgent;
  use LWP::Protocol::https;

  our %hshResultMap = (
    $RESULT_UNKNOWN             => 'Error',
    $RESULT_ERROR               => 'Error',
    $RESULT_NOT_DOWNLOADED      => 'Error',
    $RESULT_DOWNLOADED          => 'Success',
    $RESULT_ALREADY_DOWNLOADED  => 'Already',
  );

  sub new {
    my ( $class, $objOptions ) = @_;
    my $self = {
      _options             => $objOptions,
      _inputData           => undef,
      _progsFileBasename   => $GIP_PROGS_BASENAME,
      _resultsFileBasename => $GIP_RESULTS_BASENAME,
    };
    bless $self, $class;
    return $self;
  }

  sub getProgs {
    my ( $self )           = @_;
    my $objOptions         = $self->{_options};
    my $webURI             = $objOptions->weburi();
    my $bIncludeCurrentDay = $objOptions->currentdayinclude();
    my $bGetDownloaded     = $objOptions->nodownload();
    my $verbosity          = $objOptions->verbosity();
    my $strURI             = &RhobFileUtils::FixPath( $webURI, $self->{_progsFileBasename} );
    my $ua                 = LWP::UserAgent->new;
    my %hshParams          = (); 

    $hshParams{current}    = ( $bIncludeCurrentDay ? 'true' : 'false' );
    $hshParams{downloaded} = ( $bGetDownloaded ? 'true' : 'false' );

    print "GetProgsFromWeb:current $bIncludeCurrentDay\n" if $verbosity > 1;
    print "GetProgsFromWeb:uri " . $strURI . "\n"         if $verbosity > 3;

    my $uri = URI->new( $strURI );
    $uri->query_form( %hshParams );

    my $resp = $ua->get( $uri );
    my $rc   = ${$resp}{'_rc'};
    if (!($rc >= 200 && $rc <= 299)) {
      print "GetProgsFromWeb: failed: " . ${$resp}{'_msg'} . "\n";
      exit(0);
    }
    print "GetProgsFromWeb:response:" . $resp->as_string() . "\n" if $verbosity > 3;
    my $rawProgData = $resp->decoded_content();
    print "GetProgsFromWeb:decoded content:\n" . $rawProgData . "\n" if $verbosity > 2;
    my $refArrProgList = &JSON::decode_json( $rawProgData );
    my @arrProgList    = ();

    foreach my $refProg ( @{$refArrProgList} ) {
      my %hshProg = %{$refProg};
      my @arrProg = ( $hshProg{pid}, $hshProg{title}, $hshProg{genre}, $hshProg{quality} );
      push @arrProgList, \@arrProg;
    }

    my $objInputData = new InputData( \@arrProgList, $verbosity );

    $self->{_inputData} = $objInputData;

    return $objInputData;
  }

  sub sendResults {
    my ( $self, $objFoundData ) = @_;
    my $objOptions              = $self->{_options};
    my $verbosity               = $objOptions->verbosity();
    my $webURI                  = $objOptions->weburi();
    my $ua                      = LWP::UserAgent->new;
    my $uri                     = &RhobFileUtils::FixPath( $webURI, $self->{_resultsFileBasename} );
    my @arrResult               = ();
    my $retMessage              = q||;
  
    for ( my $seqNum = 0; $seqNum < $objFoundData->getNumItems(); ++$seqNum ) {
      my $objFoundItem  = $objFoundData->getItemBySeqNum( $seqNum );
      my $pid           = $objFoundItem->pid();
      my $pathname      = $objFoundItem->pathname();
      my $result        = $objFoundItem->result();
      my %hshResultItem = ();
  
      if ( !defined( $pathname ) ) { $pathname = ""; }
  
      $hshResultItem{pid}    = $pid;
      $hshResultItem{status} = $hshResultMap{$result};
  
      push @arrResult, ( \%hshResultItem );
    }

    if ( $#arrResult >= 0 ) {
      my $req  = HTTP::Request->new( 'PATCH', $uri );
      my $body = &JSON::encode_json( \@arrResult );
      $req->content_type('application/json');
      $req->content( $body );

      print "Results to web: " . $body . "\n" if $verbosity > 1;

      #my @arrHeader = (
      #  [ 'Content-Type',   'application/json; charset=UTF-8' ],
      #  [ 'Content-Length', '' . length($body) ],
      #);
      my $resp    = $ua->request( $req );
      $retMessage = $resp->as_string();

      print "Received reply: $retMessage\n" if $verbosity > 0;
    } else {
      $retMessage = 'Nothing to update';

      print "No results to send to web\n" if $verbosity > 0;
    }

    return $retMessage;
  }

  1;
}

##################################################################################################
# package:     MP3Item
# Description: Converts a raw audio file to MP3 format and updates the tags.
{
  package MP3Item;

  sub new {
    my ( $class, $objOptions, $objFoundItem ) = @_;
    my $self = {
      _options     => $objOptions,
      _foundItem   => $objFoundItem,
      _newPathname => undef,
    };
    bless $self, $class;
    return $self;
  }

  sub process {
    my ( $self ) = @_;
    my $objFoundItem       = $self->{_foundItem};
    my $objOptions         = $self->{_options};
    my $pid                = $objFoundItem->pid();
    my $origBasename       = $objFoundItem->origbasename();
    my $downloadedPathname = $objFoundItem->pathname();
    my $result             = $objFoundItem->result();
    my $verbosity          = $objOptions->verbosity();

    if ( ( length($downloadedPathname) == 0 ) || ( $result eq $RESULT_NOT_DOWNLOADED ) ) {
      print("Item not downloaded:$pid\n");
    } else {
      my $newPathname       = $objFoundItem->getOutputPathname( $verbosity );
      $self->{_newPathname} = $newPathname;

      $self->convertToMP3();
      $self->updateInfo();
    }
  }

  sub getBitsPerSecond {
    my ( $self ) = @_;
    my $objFoundItem = $self->{_foundItem};
    my $quality      = $objFoundItem->quality();
    my $bitsPerSecond;

    if ( $quality eq $QUALITY_HIGH ) {
      $bitsPerSecond = $mp3BitsPerSecondHigh;
    } else {
      $bitsPerSecond = $mp3BitsPerSecondDefault;
    }

    return $bitsPerSecond; 
  }

  sub convertToMP3 {
    my ( $self ) = @_;
    my $objFoundItem       = $self->{_foundItem};
    my $objOptions         = $self->{_options};
    my $srcPathname        = $objFoundItem->pathname();
    my $dstPathname        = $self->{_newPathname};
    my $verbosity          = $objOptions->verbosity();
    my $bitsPerSecond      = $self->getBitsPerSecond();
    my $inputFilename      = &RhobGetIPlayerUtils::convertToWindowsPathname( $srcPathname );
    my $outputFilename     = &RhobGetIPlayerUtils::convertToWindowsPathname( $dstPathname );
    my $cmd;
  
    $cmd  = qq|"$GETIPLAYER_FFMPEG"|;
    $cmd .= q| -i | . qq|"$inputFilename"|;
    $cmd .= " -vn"; 
    $cmd .= " -b:a $bitsPerSecond"; 
    $cmd .= qq| "$outputFilename"|;

    print $cmd,"\n" if $verbosity;
  
    print "Convert \"$inputFilename\" to \"$outputFilename\"\n";
  
    &RhobGetIPlayerUtils::RunGipCmd( $cmd );
  }

  sub calcLocalThumbnail {
    my ( $self ) = @_;
    my $objFoundItem          = $self->{_foundItem};
    my $objOptions            = $self->{_options};
    my $rawDownloadedPathname = $objFoundItem->pathname();
    my $downloadedPathname    = &RhobGetIPlayerUtils::convertToUnixPathname( $rawDownloadedPathname );
    my $webThumbnail          = $objFoundItem->thumbnail();
    my $verbosity             = $objOptions->verbosity();
    my $thumbnail             = q||;
    my $dir;
    my $audioFilenamePart;
    my $imageSuffix;
    # The audio file basename may contain a suffix not found on the associated image file.
    # First try audio filename, then try it with the suffix stripped
    # e.g., audio filename "BBC_News-BBC_News_original.raw.m4a"
    # Try associated image file basenames in order:
    #    - "BBC_News-BBC_News_original.raw.jpg";
    #    - "BBC_News-BBC_News_original.jpg".
    my @arrPossibleFilenameSuffix = ( q||, q|.raw| ); # Strip this from the end of the file basename.
  
    $dir               = &RhobFileUtils::GetDirname( $downloadedPathname );
    $audioFilenamePart = &RhobFileUtils::GetFilenamePart( $downloadedPathname );
    $imageSuffix       = &RhobFileUtils::GetFilenameSuffix( $webThumbnail );
  
    foreach my $possibleSuffix ( @arrPossibleFilenameSuffix ) {
      my $imageFilenamePart = $audioFilenamePart;
      $imageFilenamePart =~ s|${possibleSuffix}$||;
      my $base              = $imageFilenamePart . $imageSuffix;
      my $possibleFilename = &RhobFileUtils::FixPath($dir,$base);
      print "Trying thumbnail: $possibleFilename\n" if ($verbosity > 2);
      if ( -r "$possibleFilename" ) {
        $thumbnail = $possibleFilename;
        last;
      }
    }
  
    if ( $thumbnail eq q|| ) {
      print "Thumbnail not downloaded: $thumbnail\n" if ($verbosity > 1);
      $thumbnail = undef;
    }
  
    return $thumbnail;
  }

  sub updateInfo {
    my ( $self ) = @_;
    my $objFoundItem          = $self->{_foundItem};
    my $objOptions            = $self->{_options};
    my $verbosity             = $objOptions->verbosity();
    my $mp3File               = $self->{_newPathname};
    my $title                 = "";
    my $year                  = "";
    my $track                 = "";
    my $genre                 = $objFoundItem->genre();
    my $programTitle          = $objFoundItem->title();
    my $description           = $objFoundItem->description();
    my $thumbnail             = $self->calcLocalThumbnail();
    my $artist                = $objFoundItem->artist();
    my $albumArtist           = $objFoundItem->albumartist();
    my $album                 = $objFoundItem->album();
    my $comments              = $self->genComment();
    my $cmd;
  
    $title       = $self->escapeChars( $title );
    $artist      = $self->escapeChars( $artist );
    $albumArtist = $self->escapeChars( $albumArtist );
    $album       = $self->escapeChars( $album );
    $genre       = $self->escapeChars( $genre );
    $year        = $self->escapeChars( $year );
    $track       = $self->escapeChars( $track );
    $comments    = $self->escapeChars( $comments );
    $thumbnail   = $self->escapeChars( $thumbnail );
  
    $cmd = $GETIPLAYER_MP3INFO;
    $cmd .= q| -N|;  # Disable autofill and normalisation, so that title can be cleared
    $cmd .= q| -t | . qq|"$title"|            if defined($title);
    $cmd .= q| -a | . qq|"$artist"|           if defined($artist);
    $cmd .= q| -F | . qq|TPE2="$albumArtist"| if defined($albumArtist);
    $cmd .= q| -l | . qq|"$album"|            if defined($album);
    $cmd .= q| -g | . qq|"$genre"|            if defined($genre);
    $cmd .= q| -y | . qq|"$year"|             if defined($year);
    $cmd .= q| -n | . qq|"$track"|            if defined($track);
    # mp3info2 can corrupt the tags if the comments are long, or if the thumbnail is set.
    # Not sure exactly what causes it.
    # May just be the command line length; may be due to the autofill and normalisation being disabled.
    # Run these two as a separate command.
    #$cmd .= q| -c | . qq|"$comments"|         if defined($comments);
    #$cmd .= q| -F | . qq|"APIC < $thumbnail"| if ( defined($thumbnail) && -r $thumbnail );
    $cmd .= "    \"$mp3File\"";
    $cmd .= " &> /dev/null" if $verbosity < 2;
  
    print $cmd,"\n" if $verbosity > 1;
  
    system( $cmd );

    # Update the thumbnail and comments.
    if ( defined($comments) || (defined($thumbnail) && -r $thumbnail) ) {
        $cmd = $GETIPLAYER_MP3INFO;
        $cmd .= q| -c | . qq|"$comments"|         if defined($comments);
        $cmd .= q| -F | . qq|"APIC < $thumbnail"| if ( defined($thumbnail) && -r $thumbnail );
        $cmd .= "    \"$mp3File\"";
        $cmd .= " &> /dev/null" if $verbosity < 2;
        print $cmd,"\n" if $verbosity > 1;
        system( $cmd );
    }

  }

  sub genComment {
    my ( $self )     = @_;
    my $objFoundItem = $self->{_foundItem};
    my $title        = $objFoundItem->title();
    my $description  = $objFoundItem->description();
    my $comment;
  
    $title =~ s/\s+$//;
    $title =~ s/^\s+//;
    $title =~ s/^-//;
  
    if ( length($title) > 0 ) {
      if ( $title !~ m/:$/ ) {
        $title .= q| :|;
      }
  
      $title .= q| |;
    }
  
    $description =~ s/\s+$//;
    $description =~ s/^\s+//;
  
    $comment = $title . $description;
  
    return $comment;
  }

  sub escapeChars {
    my ( $self, $str ) = @_;
  
    if ( defined($str) ) {
      # Escape double quotes
      $str =~ s|"|\\"|g;
    }
  
    return $str;
  }

  1;
}

##################################################################################################
# package:     DownloadFilesItem
# Description: Calls get_iplayer to download the requested item in raw audio format.
{
  package DownloadFilesItem;

  import DownloadHistory;

  sub new {
    my ( $class, $objOptions, $objFoundItem ) = @_;
    my $self = {
      _options     => $objOptions,
      _foundItem   => $objFoundItem,
      _gipcmd      => q|"| . $GETIPLAYER . q|"|,
    };
    bless $self, $class;
    return $self;
  }

  sub downloadFile {
    my ( $self ) = @_;
    my $objFoundItem = $self->{_foundItem};
    my $objOptions   = $self->{_options};
    my $verbosity    = $objOptions->verbosity();
    my $cmd;

    $cmd = $self->genGetIPlayerCmd();

    print $cmd,"\n" if $verbosity; 

    &RhobGetIPlayerUtils::RunGipCmd( $cmd );

    $self->setHistoryDirty();
  }

  sub setHistoryDirty {
    my ( $self )  = @_;
    my $objOptions = $self->{_options};
    my $verbosity  = $objOptions->verbosity();
    my $objDownloadHistory = new DownloadHistory( $verbosity );
    $objDownloadHistory->setDirty();
  }

  sub genEnv {
    my $strEnv = q||;

    foreach my $env ( keys( %HSH_GETIPLAYER_ENV ) ) {
      no strict 'refs';
      my $envValue = $HSH_GETIPLAYER_ENV{$env};
      $strEnv .= $env . q|="| . $envValue . q|" |;
    }

    return $strEnv;
  }

  sub genGetIPlayerCmd {
    my ( $self ) = @_;
    my $objFoundItem      = $self->{_foundItem};
    my $objOptions        = $self->{_options};
    my $force             = $objOptions->force();
    my $overwrite         = $objOptions->overwrite();
    my $additionalOptions = $objOptions->gipargs();
    my $verbosity         = $objOptions->verbosity();
    my $env               = $self->genEnv();
    my $cmd               = $env . $self->{_gipcmd};
    my $pid               = $objFoundItem->pid();
    my $quality           = $objFoundItem->quality();
    my $modeOptions;
  
    $modeOptions =  " --raw";
    $modeOptions .= " --type=radio";
  
    if ( $quality eq $QUALITY_HIGH ) {
      $modeOptions .= " --quality" . $GIP_AUDIO_MODE_ARGS_HIGH;
    } else {
      $modeOptions .= " --quality " . $GIP_AUDIO_MODE_ARGS_NORMAL;
    }
  
    $cmd .= " --pid $pid";
    $cmd .= " $additionalOptions";
    $cmd .= " $modeOptions";
    $cmd .= " --force"     if $force;
    $cmd .= " --overwrite" if $overwrite;
    #$cmd .= " --verbose" if ($verbosity > 0);
  
    return $cmd;
  }

  1;
}

##################################################################
# package:     DownloadFiles
# Description: Holds a set of DownloadFilesItem objects and processes the raw audio files to generate MP3s with tags.
{
  package DownloadFiles;

  import DownloadFilesItem;

  sub new {
    my ( $class, $objOptions, $objFoundData ) = @_;
    my $self = {
      _options     => $objOptions,
      _founddata   => $objFoundData,
    };
    bless $self, $class;
    return $self;
  }

  sub download {
    my ( $self )     = @_;
    my $objOptions   = $self->{_options};
    my $objFoundData = $self->{_founddata};
    my $cmd;
    my $pid;
    my @pidsToDownload = ();
    my $verbosity      = $objOptions->verbosity();
    my $force          = $objOptions->force();
    my $numFoundItems  = $objFoundData->getNumItems();
  
    die( "Nothing to download" ) unless $objFoundData->anythingToDownload( $force, $verbosity );
  
    for ( my $seqNum = 0; $seqNum < $numFoundItems; ++$seqNum ) {
      my $objFoundItem      = $objFoundData->getItemBySeqNum( $seqNum );
      my $downloadFilesItem = new DownloadFilesItem( $objOptions, $objFoundItem );
      $downloadFilesItem->downloadFile();
    }
  
    $objFoundData->updateFromHistory( $verbosity );
  }

  sub processDownloaded {
    my ( $self, $nodownload ) = @_;
    my $objOptions            = $self->{_options};
    my $objFoundData          = $self->{_founddata};
    my $verbosity             = $objOptions->verbosity();
    my $numFoundItems         = $objFoundData->getNumItems();
  
    for ( my $seqNum = 0; $seqNum < $numFoundItems; ++$seqNum ) {
      my $objFoundItem       = $objFoundData->getItemBySeqNum( $seqNum );
      my $pid                = $objFoundItem->pid();
      my $origBasename       = $objFoundItem->origbasename();
      my $downloadedPathname = $objFoundItem->pathname();
      my $result             = $objFoundItem->result();
  
      if ( ( length($downloadedPathname) == 0 ) || ( $result eq $RESULT_ERROR ) ) {
        print("Item not downloaded:$pid\n");
      } elsif ( ( $result eq $RESULT_DOWNLOADED ) || $nodownload ) {
        my $mp3Item = new MP3Item( $objOptions, $objFoundItem );
        $mp3Item->process();
      }
    } 

    $objFoundData->printDownloadResults();
  }

  1;
}

###################################################################################################
## Name    : GenNewBasename
## Args    : 0 (IN) - the program ID.
##           1 (IN) - the basename specified in the input data.
##           2 (IN) - the number of programs that matched the input data.
##           3 (IN) - the index of this progam in the number of programs that matched,
##                    the index starts at 1.
##           4 (IN) - the verbosity level.
## Returns : The new basename for the downloaded file.
##
#sub GenNewBasename
#{
#  my $id           = $_[0];
#  my $origBasename = $_[1];
#  my $numIdsInSet  = $_[2];
#  my $indexInSet   = $_[3]; # Starting from 1
#  my $verbosity    = $_[4];
#  my $newBasename  = "";
#  my %radioCache   = &GetRadioCache($verbosity);
#  my $cacheItem;
#  my $suffix = "";
#
#  $cacheItem = $radioCache{$id};
#
#  # If the original basename does not end with a sequence of digits
#  if ( $origBasename !~ m|[0-9]+$| ) {
#    my $series  = ${$cacheItem}{series};
#    my $episode = ${$cacheItem}{episode};
#
#    if ( defined($series) && length($series) ) {
#      $suffix .= sprintf("S%02d",$series);
#    }
#    if ( defined($episode) && length($episode) ) {
#      $suffix .= sprintf("E%02d",$episode);
#    }
#  } elsif ( $numIdsInSet > 1 ) { # else Basename ends with a sequence of digits
#    $newBasename = &GenIncrementalSuffixBasename($origBasename,$indexInSet);
#  }
#
#  if ( length($newBasename) == 0 ) {
#    if ( (length($suffix) == 0) && ($numIdsInSet > 1) ) {
#      # Need to add some sort of suffix
#      if ( $origBasename !~ m|_$| ) {
#        $suffix = "_";
#      }
#
#      $suffix .= sprintf("%02d",$indexInSet);
#    }
#
#    $newBasename = $origBasename . $suffix;
#  }
#
#  return $newBasename;
#}

###################################################################################################
## Name    : GenIncrementalSuffixBasename
## Args    : 0 (IN) - the basename specified in the input data.
##           1 (IN) - the index of this progam in the number of programs that matched,
##                    the index starts at 1.
## Returns : The new basename for the file.
## Desc    : If the basename has trailing digits and multiple programs were found,
##           use the trailing digits for the basename and increment them accordingly.
##           The number of digits is retained:
##           e.g.1, for a basename of "file2" and an index of 2, the returned basename is "file3".
##           e.g.2, for a basename of "file002" and an index of 2, the returned basename is "file003".
##
#sub GenIncrementalSuffixBasename
#{
#  my $origBasename = $_[0];
#  my $indexInSet   = $_[1];
#  my $newBasename  = $origBasename;
#  my $suffix;
#  my $newSuffix;
#  my $preSuffix;
#  my $val;
#  my $numDigits;
#  my $formatString;
#
#  if ( $origBasename =~ m|(.*)([0-9]+)$| ) {
#    $preSuffix = $1;
#    $suffix    = $2;
#    $val       = 0 + $suffix;
#    $numDigits = length($suffix);
#
#    $val = $val + $indexInSet - 1;
#
#    $formatString = sprintf("%%s%%0%dd",$numDigits);
#
#    $newBasename = sprintf($formatString,$preSuffix,$val);
#  }
#
#  return $newBasename;
#}

###################################################################################################
## Name    : GetDownloadedPathname
## Args    : 0 (IN) - the PID
##           1 (IN) - verbosity level
## Returns : The full Windows pathname of the downloaded program if it was found in the download history,
##           the null string otherwise.
## Desc    : Extract the downloaded pathname from the download history.
##
#sub GetDownloadedPathname
#{
#  my $pid       = $_[0];
#  my $verbosity = $_[1];
#  my $pathname  = "";
#  my $objDownloadHistory     = new DownloadHistory( $verbosity );
#  my $objDownloadHistoryItem = $objDownloadHistory->getItem($pid);
#
#  if ( $objDownloadHistoryItem ) {
#    $pathname = $objDownloadHistoryItem->pathname();
#  }
#
#  if ( ! defined($pathname) ) {
#    $pathname = "";
#  }
#
#  return $pathname;
#}

import GipOptions;
import WebProgs;
import FoundData;
import DownloadFiles;

sub Process {

  my $objOptions   = GipOptions->new();
  my $objWebProgs  = WebProgs->new( $objOptions );
  my $objInputData = $objWebProgs->getProgs();

  if ( $objOptions->print() ) {
    $objInputData->print();
    exit(0); # Exit without doing anything
  }
  
  # Download the files
  my $objFoundData = FoundData->new( $objOptions, $objInputData );
  
  my $objDownloadFiles = new DownloadFiles( $objOptions, $objFoundData );

  if ( ! $objOptions->nodownload() ) {
    $objDownloadFiles->download();
  }
  
  $objDownloadFiles->processDownloaded( $objOptions->nodownload() );
  
  $objWebProgs->sendResults( $objFoundData );
}

return 1; # Package return

