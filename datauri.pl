#!/usr/bin/perl


use strict;

open my $fh, "iview.html" or die;
open F, ">d" or die;

print F q{var datauri = 'data:text/html;charset=utf-8,};

while ( <$fh> ) {
	chomp;
	s/^\s+|\s+$//;
	s|([+/:=;#,?])|'%'.unpack("H2", $1)|eg;
	print F $_;
}
	
print F q{';};
