#
#

use strict;
use warnings;

package RhobGipConfig;

# All Cygwin pathnames
our $GETIPLAYERHOME                 = q|/usr/bin|; # GETIPLAYERHOME : the directory in which get_iplayer is installed
our $GETIPLAYERDATA                 = q|/home/rweber/gip|;
our $GETIPLAYER                     = "${GETIPLAYERHOME}/get_iplayer";      # the full path to the get_iplayer executable
our $GETIPLAYERUSERPREFS            = "${GETIPLAYERDATA}/data";
our $GETIPLAYER_FFMPEG              = "/usr/bin/ffmpeg";
our $GETIPLAYER_MP3INFO             = "/usr/local/bin/mp3info2";
our $GETIPLAYER_OUTPUT              = "${GETIPLAYERDATA}/iPlayer Recordings";
our $GETIPLAYER_OUTPUT_MP3          = "${GETIPLAYERDATA}/iPlayer MP3s";

our $GIP_LOCAL_DIR_URI              = 'http://localhost:13003/gip_edit/api';
#our $GIP_LOCAL_DIR_URI              = 'http://localhost:3010/api/';
our $GIP_REMOTE_DIR_URI             = 'https://<DOMAIN>/gip_edit/api/';
#our $GIP_PROGS_BASENAME             = 'get_progs.php';
#our $GIP_RESULTS_BASENAME           = 'prog_results.php';
our $GIP_PROGS_BASENAME             = 'programs';
our $GIP_RESULTS_BASENAME           = 'programs';

our $GIP_FILENAME_DISCRIMINATOR     = q|_Renamed_|; # If a duplicate output filename is found, append the filename with this and a number.

our $GIP_RADIO_CACHE_BASENAME       = q|radio.cache|;
our $GIP_DOWNLOAD_HISTORY_BASENAME  = q|download_history|;

# All MP3s are created with this artist name
our $GIP_DEFAULT_ARTIST             = q|aaaa Radio Download|;
our $GIP_DEFAULT_ALBUM_ARTIST       = q|aaaa Radio Download|;
our $GIP_DEFAULT_ALBUM              = q|BBC Radio|;


# Prior to get_iplayer v3.0, these were the arguments used
# our $GIP_AUDIO_MODE_ARGS_NORMAL = "flashaudio,flashaac,flashaaclow,flashaacstd,rtspaaclow,rtspaacstd,wma";
# v3.0 changed the modes:
#    hafhigh is 320 Kb/s, which is too much for normal audio
# v3.17 changed again, was
# our $GIP_AUDIO_MODE_ARGS_NORMAL  = "hafmed,haflow,hafstd,hlsaacstd,hlsaaclow";
# our $GIP_AUDIO_MODE_ARGS_HIGH    = "hafhigh,hafmed,haflow,hafstd,hlsaachigh,hlsaacstd,hlsaaclow";
# vxxxx
our $GIP_AUDIO_MODE_ARGS_NORMAL = "std,med,low";
our $GIP_AUDIO_MODE_ARGS_HIGH   = "high,med,haflow,std";

return 1; # Package return

