#!perl
use strict;

my %hshArgs = (
  stackname => q|gip-edit-react-dev|,
  region    => q|eu-west-1|,
  policy    => q|stack-policy-allow-update.json|,
  profile   => q|PowerUserAccess-492835583127|,
);

sub genCmd {
  my $cmd = q|aws cloudformation set-stack-policy|;
  $cmd .= q| --stack-name |               . $hshArgs{stackname};
  $cmd .= q| --region |                   . $hshArgs{region};
  $cmd .= q| --stack-policy-body file://| . $hshArgs{policy};
  if (defined($hshArgs{profile})) {
    $cmd .= q| --profile | . $hshArgs{profile};
  }
  return $cmd;
}

my $cmd = &genCmd();
print $cmd . "\n";
