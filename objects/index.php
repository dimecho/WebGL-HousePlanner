<?php 
 
    //header("Content-type: text/xml");
    header("Content-type: text/json");

    $xml = new SimpleXMLElement('<xml></xml>');
    $xml->addAttribute('menu', $_GET['item']);

    $path = realpath('./'. $_GET['item']));
	foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path)) as $filename)
	{
	    echo "$filename\n";

	    $ext = pathinfo($filename, PATHINFO_EXTENSION);

		//$xml = simplexml_load_string($xmlstring);
	    //$json = json_encode($xml);
	    //$array = json_decode($json,TRUE);

	    $member = $xml->addChild('vendor', '1');
	    $member->addAttribute('extra', 'info');
	    $member->addChild('category', 'Furnishings');

	    $member = $xml->addChild('vendor', '2');
	    $member = $xml->addChild('vendor', '3');
	}

    echo json_encode($xml);
    //echo $xml->asXML();

?>
