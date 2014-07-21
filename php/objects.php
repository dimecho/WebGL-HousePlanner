<?php 
 
 if(isset($_FILES["fileInput"]) && $_FILES["fileInput"]["error"]== UPLOAD_ERR_OK)
{
    ############ Edit settings ##############
    $UploadDirectory    = '/home/website/file_upload/uploads/'; //specify upload directory ends with / (slash)
    ##########################################
   
    /*
    Note : You will run into errors or blank page if "memory_limit" or "upload_max_filesize" is set to low in "php.ini".
    Open "php.ini" file, and search for "memory_limit" or "upload_max_filesize" limit
    and set them adequately, also check "post_max_size".
    */
   
    //check if this is an ajax request
    if (!isset($_SERVER['HTTP_X_REQUESTED_WITH'])){
        die();
    }
   
    //Is file size is less than allowed size.
    if ($_FILES["fileInput"]["size"] > 5242880) {
        die("File size is too big!");
    }
   
    //allowed file type Server side check
    switch(strtolower($_FILES['fileInput']['type']))
    {
        //allowed file types
 		case 'application/zip':
        case 'application/octet-stream':
            break;
        default:
            die('Unsupported File!'); //output error
    }
   
    $File_Name          = strtolower($_FILES['fileInput']['name']);
    $File_Ext           = substr($File_Name, strrpos($File_Name, '.')); //get file extention
    $Random_Number      = rand(0, 9999999999); //Random number to be added to name.
    $NewFileName        = $Random_Number.$File_Ext; //new file name
   
    if(move_uploaded_file($_FILES['fileInput']['tmp_name'], $UploadDirectory.$NewFileName ))
       {
        // do other stuff
        die('Success! File Uploaded.');
    }else{
        die('error uploading File!');
    }
}
else
{
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
}
?>
