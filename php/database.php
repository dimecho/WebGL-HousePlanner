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

    define('DB_SERVER', 'localhost');
    define('DB_USERNAME', 'root');
    define('DB_PASSWORD', '******');
    define('DB_DATABASE', 'houseplanner');
    define('DB_DRIVER', 'mysql');
?>
