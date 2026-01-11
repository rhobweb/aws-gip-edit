#!/bin/perl
#
# Script to download BBC iPlayer radio podcasts # # History
# -------
# Date       Who     Description
# ----       ---     -----------
# 31-Jul-10  Rhob    First implemented
# 05-Mar-12  Rhob    Add argument processing.
# 06-Apr-12  Rhob    Default to search. Download must be explicit argument.
# 26-Dec-22  Rhob    Use new RhobGetIPlayerUtils interface.
#
##########################################################################################

use strict;
use Getopt::Long;
use lib "/home/rweber/PerlLib";
use RhobGetIPlayerUtils;
use Data::Dumper;


#################################################################
# Main script
#################################################################

&RhobGetIPlayerUtils::Process();
