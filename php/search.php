<?php

require("database.php");

if(isset($_REQUEST['keyword']))
{
	if(strlen($_REQUEST['keyword']) > 2)
	{
		$db = new PDO(DB_DRIVER . ":host=" . DB_SERVER . ";dbname=" . DB_DATABASE, DB_USERNAME, DB_PASSWORD);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		
        $query = $db->prepare("SELECT OBJECTS.ID,OBJECTS.IMAGE,CATEGORIES.NAME FROM OBJECTS INNER JOIN CATEGORIES ON OBJECTS.CATEGORY_ID = CATEGORIES.ID WHERE CATEGORIES.NAME LIKE :value OR OBJECTS.NAME LIKE :value OR OBJECTS.SEARCH_KEYWORDS LIKE :value ORDER BY RANK_SEARCH, RANK_PLACE LIMIT 10");
        $query->bindValue(":value", "%" . $_REQUEST['keyword'] . "%");
		/*
		$query->bindParam(':value', $value, PDO::PARAM_INT);
		$query->bindParam(':value', $value, PDO::PARAM_STR, 12);
		*/
		
		$query->execute();
		$rows = $query->fetchALL(PDO::FETCH_ASSOC);

		// use array_shift to free up the memory associated with the record as we deal with it
		while($row = array_shift($rows)){
			echo '<li><img src="' .$row['IMAGE']. '" style="max-width:100%" onclick="engine3D.insert3DModel(\'' .$row['ID']. '\')" />' .$row['ID']. '</li>';
		}
		
		$db = null;
	}
}

?>