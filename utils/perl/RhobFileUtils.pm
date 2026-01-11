#!/usr/bin/perl
#
# Package of utilities for file and directory handling.
#
#

package RhobFileUtils;

use strict;
use warnings;
use File::Basename;
use File::Copy;
use File::Path;

BEGIN {
    use Exporter   ();
    our ($VERSION, @ISA, @EXPORT, @EXPORT_OK, %EXPORT_TAGS); 

    # set the version for version checking
    $VERSION     = 1.00;

    @ISA         = qw(Exporter);
    @EXPORT      = qw(&Win2CygwinPath &IsWindows &GetDirname);
    %EXPORT_TAGS = ();     # eg: TAG => [ qw!name1 name2! ],

    # your exported package globals go here,
    # as well as any optionally exported functions
    @EXPORT_OK   = qw();
}

our @EXPORT_OK;

# exported package globals go here
our $DEBUG = 0;
our $CYGWIN_CYGWIN_DIR = q|/cygdrive/c/cygwin64|; # Cygwin installation directory as a Cygwin path
# Patterns for fetching file lists
our $JpegImageFileSearchPattern = '.*(jpg|jpeg|JPG|JPEG)$';
our $TextFileSearchPattern      = '.*(txt|TXT)$';

# non-exported package globals go here

# initialize package globals, first exported ones

# then the others (which are still accessible as $Some::Module::stuff)

# all file-scoped lexicals must be created before
# the functions below that use them.

# file-private lexicals go here


##################################################################################################
# Name    : Win2CygwinPath
# Args    : Pathname in windows format, e.g., C:\Dir\filename.txt
# Returns : The pathname in Cygwin format
# Desc    : Convert the path from Windows to Cygwin
#
sub Win2CygwinPath
{
  my $path  = $_[0];

  #print "Win2CygwinPath: raw: ${path} ";

  $path =~ s|\\|/|g; # Replace annoying backslashes first
  my $drive = $path;
  $drive =~ s|^([A-Za-z]):.*|$1|i; 
  $drive = lc($drive);
  $path =~ s|^([A-Za-z]):/|/cygdrive/${drive}/|i; 

  #print "cooked: ${path}\n";

  return $path;
}

##################################################################################################
# Name    : Cygwin2WinPath
# Args    : Pathname in cygwin format, e.g., /cygrive/c/filename.txt
# Returns : The pathname in Cygwin format, e.g., C:\Dir\filename.txt
# Desc    : Convert the path from Cygwin to Windows
#
sub Cygwin2WinPath
{
  my $path = $_[0];

  #print "Cygwin2WinPath: raw: ${path} ";

  if ( $path !~ m|^[A-Za-z]:| ) { # If not already like a Windows path

    if ( $path !~ m|^/cygdrive/| ) { # If it doesn't start with the Cygwin virtual drive directory, it probably a pure Cygwin path
      $path = &FixPath( $CYGWIN_CYGWIN_DIR, $path ); # Prepend it with Cygwin virtual drive and the Cygwin installation directory
    }

    if ( $path =~ m|^/cygdrive/([A-Za-z])(/.*)$| ) { # If the pathname starts with a Cygwin virtual drive
      my $drive = uc($1);
      my $rest  = $2;
      $path = qq|$drive:$rest|;                      # Convert it to Windows format
    }
  } 

  $path =~ s|/|\\|g; # Convert slashes to backslashes

  #print "cooked: ${path}\n";

  return $path;
}

##################################################################################################
# Name    : IsWindows
# Args    : None
# Returns : 1 if is running under Windows, 0 if running under Cygwin or other OS
# Desc    : Determine whether the current OS is Windows
#
sub IsWindows
{
    my $isWindows = 0;

    if ( $^O eq "MSWin32" )
    {
        $isWindows = 1;
    }

    return $isWindows;
}

##################################################################################################
# Name    : GetCurrentDir
# Args    : None
# Returns : The pathname of the current directory
# Desc    : Get the current directory pathname
#
sub GetCurrentDir
{
    my $dir;

    if ( &IsWindows() )
    {
        $dir = `cd`;
    }
    else
    {
        $dir = `pwd`;
    }

    $dir =~ s/[\n\r]+$//;
    $dir = &FixDir($dir);

    return $dir;
}

##################################################################################################
# Name    : GetDirname
# Args    : 0 (IN)  a pathname
# Returns : The directory part of the pathname
# Desc    : Returns the directory part of a pathname, allowing for both DOS and UNIX separators
#           If the pathname is a directory, just return the pathname
#
sub GetDirname
{
    my $pathname = $_[0];
    my $dirname  = $pathname;

    # IF the path contains DOS separators
    if ( $pathname =~ m|\\| )
    {
        $dirname =~ s|\\[^\\]+$|\\|;
    }
    else
    {
        $dirname =~ s|/[^/]+$|/|;
    }

    return $dirname;
}

##################################################################################################
# Name    : FixDir
# Args    : 0 (OUT)  a directory pathname
# Returns : Fixed directory pathname
# Desc    : Fixes a directory path for use in Cygwin and Windows.
#           Ensures that it is terminated with a /
#
sub FixDir
{
  my $dir = $_[0];
  if ( defined($dir) and (length($dir) > 0) and $dir !~ m|/$| )
  {
    $dir = $dir . q|/|;
  }
  return $dir;
}

##################################################################################################
# Name    : FixDirPath
# Args    : 0   - a pathname component
#           1   - another pathname component (optional)
#           ... - more pathname components (optional)
# Returns : Fixed directory pathname
# Desc    : Fixes a directory path for use in Cygwin and Windows.
#           Ensures that it is terminated with a /
#
sub FixDirPath
{
  my $dir = &FixPath(@_);

  $dir = &FixDir($dir);

  return $dir;
}

############################################################################################
# Name    : FixPath
# Args    : 0   - a pathname component
#           1   - another pathname component (optional)
#           ... - more pathname components (optional)
# Returns : None
# Desc    : Fixes the pathname for use in Cygwin and Windows
#
sub FixPath
{
  my $path = undef;
  my $p;

  foreach my $item ( @_ )
  {
    $p = $item;
    $p =~ s|\\|/|g;

    if ( !defined($path) )
    {
      $path = $p; 
    }
    else
    {
      $path = &FixDir($path);
      if ( $path ) {
        $p =~ s|^/||;
      }
      $path = $path . $p;
    }
  }

  return $path;
}

sub mktree
{
    my $dirPath = $_[0];

    if ( ! -d "$dirPath" )
    {
        my @tree;
        my $originalDir = &GetCurrentDir;

        @tree = split(/\//,$dirPath);

        # If the first item is empty, must be an absolute path
        if ( length($tree[0]) == 0 )
        {
            chdir('/');
            splice(@tree,0,1)
        }

        foreach my $dir ( @tree )
        {
            if ( ! -d $dir )
            {
                mkdir($dir) || die("Unable to create directory tree $dirPath");
            }
            chdir($dir);
        }
        chdir($originalDir);
    }
}

##################################################################################################
# Name    : GetFileList
# Args    : 0 (IN)  the source directory path
#           1 (OUT) reference to an array into which is written the file/directory tree
#           2 (IN)  if true, do not recurse sub-directories
# Returns : None
# Desc    : Traverses the specified directory and generates a list of all files and directories
#           in that path. Directory names are added to the list before their contents.
#           The returned pathnames contain the source directory path.
#           e.g., if $aSourceDir is "../fred"
#                 all returned file and directory names will be prefixed with "../fred".
sub GetFileList
{
    my $aSourceDir     = $_[0];
    my $aListRef       = $_[1];
    my $aIgnoreSubDirs = $_[2];
    my $dd;
    my $file;
    my $item;

    $aIgnoreSubDirs = 0 if ! defined($aIgnoreSubDirs);

    $aSourceDir = &FixDir($aSourceDir);

    opendir($dd,"$aSourceDir") or die "Unable to open directory $aSourceDir";

    while (defined($file = readdir($dd)))
    {
        $item = $aSourceDir . $file;
        if ( -d $item && ! $aIgnoreSubDirs )
        {
            if ( $file ne '.' && $file ne '..' )
            {
                $item = &FixDir($item);
                push @{$aListRef},$item;
                &GetFileList($item, $aListRef);
            }
        }
        else
        {
            push @{$aListRef},$item;
        }
    }
}

##################################################################################################
# Name    : GetDirList
# Args    : 0 (IN)  the source directory path
#           1 (OUT) reference to an array into which is written the directories in the source
#                   directory.
# Returns : None
# Desc    : Traverses the specified directory and generates a list of all directories
#           in that path.
#           The returned directory names contain the source directory path.
#           e.g., if $aSourceDir is "../fred"
#                 all returned directory names will be prefixed with "../fred".
sub GetDirList
{
    my $aSourceDir     = $_[0];
    my $aListRef       = $_[1];
    my $aIgnoreSubDirs = $_[2];
    my $dd;
    my $file;
    my $item;

    if ( !defined($aIgnoreSubDirs) ) {
      $aIgnoreSubDirs = 0;
    }

    $aSourceDir = &FixDir($aSourceDir);

    opendir($dd,"$aSourceDir") or die "Unable to open directory $aSourceDir";

    while (defined($file = readdir($dd)))
    {
        $item = $aSourceDir . $file;
        if ( -d $item && ! $aIgnoreSubDirs )
        {
            if ( $file ne '.' && $file ne '..' )
            {
                $item = &FixDir($item);
                push @{$aListRef},$item;
                &GetDirList($item, $aListRef);
            }
        }
    }
}

##################################################################################################
# Name    : GetRelDirList
# Args    : 0 (IN)  the source directory path
#           1 (OUT) reference to an array into which is written the directories in the source
#                   directory.
# Returns : None
# Desc    : Traverses the specified directory and generates a list of all directories
#           in that path.
#           All directory names are returned without any leading relative or absolute path.
#           e.g., if a directory called "parent" contains directories called "child1" and "child2"
#                 and "child1" contains a directory called "grand1", the following list is returned:
#           child1/
#           child1/grand1/
#           child2/
#
sub GetRelDirList
{
    my $aSourceDir = &FixDirPath($_[0]);
    my $aListRef   = $_[1];

    &GetDirList($aSourceDir,$aListRef);

    map { $_ =~ s|^$aSourceDir|| } @{$aListRef};
}

##################################################################################################
# Name    : GetRelFileList
# Args    : 0 (IN)  the source directory path
#           1 (OUT) reference to an array into which is written all the files and directories
#                   under the source directory path.
# Returns : None
# Desc    : Traverses the specified directory and generates a list of all files and directories
#           in that path.
#           All file and directory names are returned without any leading relative or absolute path.
#
sub GetRelFileList
{
    my $aSourceDir     = $_[0];
    my $aListRef       = $_[1];
    my $aIgnoreSubDirs = $_[2];
    my $dd;
    my $file;
    my $item;
    my $relDir;

    if ( ! defined($aIgnoreSubDirs) )
    {
        $aIgnoreSubDirs = 0;
    }

    $aSourceDir = &FixDir($aSourceDir);

    &GetFileList($aSourceDir,$aListRef, $aIgnoreSubDirs);

    map { $_ =~ s|^$aSourceDir|| } @{$aListRef};
}

sub CopyTree
{
    my $sourceDir = $_[0];
    my $targetDir = $_[1];
    my @fileList;
    my $sourcePath;
    my $targetPath;
    my $sourceDirBasename;
    my $sourceDirDirname;

    &GetRelFileList($sourceDir,\@fileList);

    # Need to prepend the source directory basename to the file list and all files in it
    $sourceDirBasename = basename($sourceDir);
    $sourceDirDirname  = dirname($sourceDir);
    # Insert an empty item at the start
    @fileList = ( "", @fileList );
    # Prepend all items with the source directory name
    map { $_ = &FixPath($sourceDirBasename,$_); } @fileList;

    foreach my $item ( @fileList )
    {
        $sourcePath = &FixPath($sourceDirDirname,$item);
        $targetPath = &FixPath($targetDir,$item);
        if ( -d $sourcePath )
        {
            if ( ! -d $targetPath )
            {
                die("CopyTree: unable to create directory, file with same name exists: $targetPath")
                    if ( -r $targetPath );
                mkdir($targetPath);
            }
            else
            {
                print("CopyTree: target directory already exists: $targetPath\n");
            }
        }
        else # Is a regular file
        {
            if ( ! -r $targetPath )
            {
                copy($sourcePath,$targetPath);
            }
            else
            {
                print("CopyTree: target file already exists. Copy not done: $targetPath\n");
            }
        }
    }
}

##################################################################################################
# Name    : GetFileBasenames
# Args    : 0 - reference to a list of pathnames
# Returns : List of basenames
# Desc    : Strips the directory paths from the pathnames, returning a list of
#           basenames only.
#           If any pathnames are directories, an empty string is returned.
################################################################################
sub GetFileBasenames
{
    my $fileListRef = $_[0];
    my @nameList;

    @nameList = @{$fileListRef};

    map { $_ = basename($_); } @nameList;

    return @nameList;
}

##################################################################################################
# Name    : GetRelRegularFileList
# Args    : 0 - the source directory path
#           1 - reference to a list in which to put the image pathnames
# Returns : None
# Desc    : Get a list of the files under the specified source directory.
#           Each returned pathname is relative to the source directory.
#           Only a list of file pathnames is returned, directory pathnames are
#           not.
################################################################################
sub GetRelRegularFileList
{
    my $sourceDir      = &RhobFileUtils::FixDir($_[0]);
    my $fileListRef    = $_[1];
    my $aIgnoreSubDirs = $_[2];
    my $matchPattern   = $_[3];
    my @fileList;

    # Get a list of all directory and files under the source directory
    &RhobFileUtils::GetFileList($sourceDir, \@fileList, $aIgnoreSubDirs);

    # Remove any directories from the list
    for ( my $i = $#fileList; $i >= 0; $i-- )
    {
        # If the basename returns nothing it must be a directory path
        # If this pathname does not match the search string
        if (    (length(basename($fileList[$i])) == 0)
            || ((defined($matchPattern) && ($fileList[$i] !~ m|$matchPattern|i))) )
        {
            splice(@fileList,$i,1);
        }
    }

    @{$fileListRef} = @fileList;
}

sub GetFilenamePart
{
    my $path = $_[0];
    my $filenamePart;

    $filenamePart = basename($path);
    $filenamePart =~ s|\.[^\.]*$||;

    return $filenamePart;
}

sub GetFilenameSuffix
{
    my $path = &FixPath($_[0]);
    my $suffix = "";

    if ( $path =~ m|(\.[^\.]*)$| )
    {
        $suffix = $1;
    }

    return $suffix;
}

sub GetBasename
{
    my $pathname = &FixPath($_[0]);
    my $basename = "";
    my $cookedPathname = "";

    $pathname =~ s|\\|/|g; # Convert from Windows slashes to UNIX

    $cookedPathname = $pathname;
    $cookedPathname =~ s|/+$||; # Remove trailing slashes

    if ( $cookedPathname ne $pathname )
    {
        $basename = $cookedPathname;
        $basename =~ s|.*/||;
        $basename .= q|/|; # Restore the trailing slash
    }
    else
    {
        $basename = $pathname;
        $basename =~ s|.*/||;
    }

    return $basename;
}

return 1; # Package return

