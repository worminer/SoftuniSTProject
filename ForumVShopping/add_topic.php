<?php

$host="localhost"; // Host name
$username="admin"; // Mysql username
$password="admin"; // Mysql password
$db_name="forum_db"; // Database name
$tbl_name="forum_question"; // Table name

// Connect to server and select database.
mysqli_connect("$host", "$username", "$password")or die("cannot connect");
mysqli_select_db("$db_name")or die("cannot select DB");

// get data that sent from form
$topic=$_POST['topic'];
$detail=$_POST['detail'];
$name=$_POST['name'];
$email=$_POST['email'];

$datetime=date("d/m/y h:i:s"); //create date time

$sql="INSERT INTO $tbl_name(topic, detail, name, email, datetime)VALUES('$topic', '$detail', '$name', '$email', '$datetime')";
$result=mysqli_query($sql);

if($result){
    echo "Successful<BR>";
    echo "<a href=main_forum.php>View your topic</a>";
}
else {
    echo "ERROR";
}
mysqli_close();
?>