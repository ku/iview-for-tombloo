#!/usr/bin/perl

use strict;
use LWP::UserAgent;
use YAML;


use XML::LibXML;
use JSON;
use Data::Dumper;


#http://th62.deviantart.com/fs37/150 /i/2008/268/7/1/Kuroshitsuji_by_Kyoko_Taide.jpg
#http://th62.deviantart.com/fs37/300W/i/2008/268/7/1/Kuroshitsuji_by_Kyoko_Taide.jpg
#http://fc13.deviantart.com/fs37/     f/2008/268/c/2/Kuroshitsuji_by_Kyoko_Taide.jpg

my $jsonstring = <<'__JSON__';
  {
    "name": "excite",
    "updated_at": "2008-09-12T21:57:23+09:00",
    "resource_url": "http:\/\/wedata.net\/items\/2498",
    "created_by": "ku",
    "data": {
      "paragraph": "",
      "caption": "\/\/title\/text()",
      "imageSource": ".//img/@src",
      "paragraph": "//span[@id='zoomed-out']",
      "permalink": ".\//a[@title]/@href",
      "url": "http://excite.co.jp/10th/snap/",
      "nextLink": "\/\/div[@id='prev-next-links']\/\/a[not(@class='disabled')][last()]"
    }
  }
__JSON__

=from
  {
    "name": "FFFFound!",
    "updated_at": "2008-08-19T19:44:16+09:00",
    "resource_url": "http:\/\/wedata.net\/items\/2230",
    "created_by": "ku",
    "data": {
      "permalink": ".\/\/img\/parent::a\/@href",
      "paragraph": "\/\/blockquote[@class='asset']",
      "url": "http:\/\/ffffound.com\/",
      "imageSource": ".\/\/img\/@src",
      "nextLink": "\/\/a[@rel='next']\/@href",
      "caption": ".\/\/span[@class='quote']\/following-sibling::a"
    },
    "created_at": "2008-08-19T02:32:26+09:00"
  }
=cut

my $json = from_json($jsonstring);
my $siteinfo = constructTree ( $json->{data} );

our $UASTRING = "Mozilla/5.0 (Windows; U; Windows NT 5.1; ja; rv:1.8.1.12) Gecko/20080201 Firefox/2.0.0.12";
my $self = {};

$self->{parser} = XML::LibXML->new();

$self->{parser}->recover(1);
$self->{parser}->recover_silently(1);
$self->{parser}->keep_blanks(0);
$self->{parser}->expand_entities(1);

$self->{ua} = LWP::UserAgent->new();
$self->{ua}->agent($UASTRING);

#my $u = 'http://ffffonud.com/';
#my $u = 'deviantart.html';
#my $u = 'ffffound.html';
my $u = undef ;

if ( -e $u  ) {
	open my $fh, $u;
	my $html = join "", <$fh>;
#	binmode $fh; # drop all PerlIO layers possibly created by a use open pragma
#	$self->{doc} = $self->{parser}->parse_html_fh($fh);
	$self->{doc} = $self->{parser}->parse_html_string($html);
} else {
	$self->{doc} = createDocument($siteinfo->{url});
}

my @images = imagelist($siteinfo, $self->{doc});





@_ = x($siteinfo->{nextLink}, $self->{doc});
my $node = shift @_;
my $nextLink = toString($node);

print Dumper (\@images);
print "nextLink: $nextLink\n";
print "\n";

sub imagelist {
	my $siteinfo = shift;
	my $context = shift;

	my @images = ();

	my $exp = $siteinfo->{paragraph};
	print STDERR "get paragraphes $exp\n";
	my @paragraphes = x($exp, $context);
	foreach my $paragraph ( @paragraphes ) {
		my $image = parseParagraph($paragraph, $siteinfo);
		
		if ( $siteinfo->{subRequest} ) {
			my $u = $image->{permalink};
			my $subdoc = createDocument($u);
			$subdoc or next;

			my @d = imagelist($siteinfo->{subRequest}, $subdoc);
			
			push @images, map {
				$_->{permalink} = $u;
				$_;
			} @d ;
		}

		push @images, $image;
	}
	print Dumper \@images;
	@images;
}

sub createDocument {
	my $u = shift;

print STDERR "get $u\n";
	my $res = $self->{ua}->get($u);
	$res->is_success or return;

	my $html = $res->content;
	
	open F, ">deviantart.html" or die;
	print F $html;

	$self->{parser}->parse_html_string($html);
}


sub x {
	my $exp = shift;
	my $context = shift;

	my @res = ();
#	print STDERR "$exp\n";
	
	my $rs = $context->find($exp);
	while ( my $p = $rs->shift ) {
		push @res, $p;
	}
	@res;
}

sub toString {
	my $rs = shift;
	if ( $rs->isa( 'XML::LibXML::Literal' ) ) {
		$rs->value;
	} elsif ( $rs->isa( 'XML::LibXML::Text' ) ) {
		$rs->nodeValue;
	} elsif ( $rs->isa( 'XML::LibXML::Number' ) ) {
		$rs->value;
	} elsif ( $rs->isa( 'XML::LibXML::Boolean' ) ) {
		$rs->value;
	} elsif ( $rs->isa( 'XML::LibXML::Element' ) ) {
		my $name =  $rs->nodeName ;
		if ( $name eq 'a' ) {
			$rs->getAttribute('href');
		} elsif ($name eq 'img' )  {
			$rs->getAttribute('src');
		} else {
			$rs->textContent;
		}
	} elsif ( $rs->isa( 'XML::LibXML::Attr' ) ) {
		$rs->nodeValue;
	} elsif ( $rs->isa( 'XML::LibXML::NodeList' ) ) {
		my $node = $rs->shift;
		$node ?  toString($node) : undef;
	} else {
		die $rs;
	}
}

sub parseParagraph {
	my $paragraph = shift;
	my $siteinfo = shift;

	my $image = {};
	my @paragraphes = x($siteinfo->{paragraph}, $self->{doc});
	foreach my $key ( qw/permalink imageSource imageSourceForReblog caption / ) {
		my $xpath = $siteinfo->{$key} or next;
		@_ = x($xpath, $paragraph);
		my $node = shift @_;
		
		if ( !$node ) {
			#print $paragraph->toString;
			next;
		}
		my $v = ($key eq 'caption') ? $node->textContent : toString($node);
		$v = substr($v, -60);
		#print "$key>$v\n";
		$image->{$key} = $v;
	}
	$image;
}
sub constructTree {
	my $flatSiteinfo = shift;
	my $siteinfo = {};
	foreach my $k ( keys %$flatSiteinfo ) {
		my @pathes = split /\./, $k;
		my $leaf = pop @pathes;
		my $hash = $siteinfo;
		map {
			$hash = $hash->{$_} || ($hash->{$_} = {})
		} @pathes;
		my $v = $flatSiteinfo->{$k};
		if ( $v ) {
			$hash->{$leaf} = $v;
		}
	}

	if ( $siteinfo->{subRequest} and !$siteinfo->{subRequest}->{paragraph} ) {
		delete $siteinfo->{subRequest};
	}
	if ( $siteinfo->{subParagraph} and !$siteinfo->{subParagraph}->{paragraph} ) {
		delete $siteinfo->{subParagraph};
	}
	$siteinfo;
}

