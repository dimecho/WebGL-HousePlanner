<?php

	//ini_set('display_errors',1);
    //error_reporting(E_ALL);

	if(session_status()!=PHP_SESSION_ACTIVE)
	{	
		//HTTP sessions are not passed to HTTPS ...this is a FIX
		//==============================
    	if (!empty($_POST['session']))
    	{
			session_id($_POST['session']);
    	}
    	//==============================
		session_start();
	}

	try
	{
		$GLOBALS['pdo'] = new PDO('mysql:host=localhost;dbname=houseplanner','username','password');
	} 
	catch(PDOException $e)
	{
		echo 'Connection failed'.$e->getMessage();
	}
?>
