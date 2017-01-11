<?php
$meffect='top';
$mid='';
$author_show = 1;
$author_desc = 'Author @DARTCreations <a href="http://www.dart-creations.com">Wordpress Full Screen Menu by DART Creations</a>';
$bgcolor = '#81d742';
$txtcolor = '#000000';
$txtfont = 'Exo';
if(isset($link['menu_effect'])){
	$meffect = $link['menu_effect'];
	$mid = $link['menu_id'];
	if($link['menu_author_show']=='')
		$author_show = 0;
	if($link['menu_author_desc']!='')
		$author_desc = $link['menu_author_desc'];
	if($link['menu_background_color']!='')
		$bgcolor = $link['menu_background_color'];
	if($link['menu_text_color']!='')
		$txtcolor = $link['menu_text_color'];
	if($link['menu_text_font']!='')
		$txtfont = $link['menu_text_font'];
}
?>

<div>
  <h2>DC Fullscreen Menu Settings</h2>
</div>
<hr />
<form method="post" action="themes.php?page=dc_fullscreen_menu_list">
  <table class="form-table">
    <tbody>
      <tr>
        <th scope="row">Menu List:</th>
        <td><select id="menu_list_cat" name="menu_list_cat">
            if
            
            <?php 
					
					foreach ( $menus as $menu ) {
						$selected = $mid == $menu->term_id ? ' selected="selected"' : '';
						echo '<option'. $selected .' value="'. $menu->term_id .'">'. $menu->name .'</option>';
					}
					?>
          </select></td>
      </tr>
      <tr>
        <th scope="row">Effect:</th>
        <td><input type="radio"  value="" id="menu_list_effect0" name="menu_list_effect" <?php if($meffect== ''){ ?> checked="checked" <?php }?>>
          No Effect
          &nbsp;&nbsp;
          <input type="radio"  value="top" id="menu_list_effect1" name="menu_list_effect" <?php if($meffect== 'top'){ ?> checked="checked" <?php }?>>
          Top
          &nbsp;&nbsp;
          <input type="radio"  value="bottom" id="menu_list_effect1" name="menu_list_effect" <?php if($meffect== 'bottom'){ ?> checked="checked" <?php }?>>
          Bottom
          &nbsp;&nbsp;
          <input type="radio"  value="right" id="menu_list_effect2" name="menu_list_effect" <?php if($meffect== 'right'){ ?> checked="checked" <?php }?>>
          Right
          &nbsp;&nbsp;
          <input type="radio" value="left" id="menu_list_effect3" name="menu_list_effect" <?php if($meffect== 'left'){ ?> checked="checked" <?php }?>>
          Left </td>
      </tr>
      <tr>
        <th>Background Color:</th>
        <td><input type="text"  value='<?php echo $bgcolor; ?>' id="menu_background_color" name="menu_background_color" class="color-field"></td>
      </tr>
      <tr>
        <th>Text Color:</th>
        <td><input type="text"  value='<?php echo $txtcolor; ?>' id="menu_text_color" name="menu_text_color" class="color-field"></td>
      </tr>
       <tr>
        <th>Google Font:</th>
        <td><input type="text"  value='<?php echo $txtfont; ?>' id="menu_text_font" name="menu_text_font" ></td>
      </tr>
      <tr>
        <th><input type="checkbox"  value="1" id="menu_author_show" name="menu_author_show" <?php if($author_show== 1){ ?> checked="checked" <?php }?>>
          Tiny link to Author</th>
        <td><input type="hidden"  value='Author @DARTCreations <a href="http://www.dart-creations.com">Wordpress Full Screen Menu by DART Creations</a>' id="menu_author_desc" name="menu_author_desc" size="115"></td>
      </tr>
      <tr>
        <th colspan="2"> <input type="submit" value="Submit" class="button button-primary" id="submit" name="submit">
        </th>
      </tr>
    </tbody>
  </table>
</form>