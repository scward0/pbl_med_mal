<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */


// uncomment 27-33 and comment 37-43 for local development

// define('DB_NAME', 'localwp');
//
// /** MySQL database username */
// define('DB_USER', 'root');
//
// /** MySQL database password */
// define('DB_PASSWORD', 'root');



define('DB_NAME', 'localwp');

/** MySQL database username */
define('DB_USER', 'root');

/** MySQL database password */
define('DB_PASSWORD', 'SilverH3elm1!');




/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'M)r**O/)+Bd6{L=6{E(yPQyN?cljVZZet~aYu_`!fVS3L:B!w68+{Ccc.=eSgl@^');
define('SECURE_AUTH_KEY',  '{Dsd?),e,dbZD{s)b@c{seeGaCZ_$.sy_uB/L[@%om50n#z%f$9|CNkx4E),xZL6');
define('LOGGED_IN_KEY',    'G=Q&|e2CN$k(Z|&J3T+}Vrkz:gSY3vR>Aw$wE>IR#Uru9jsL3Vf kBPna^,7V5ac');
define('NONCE_KEY',        '*0dFb:q-GE}JU>|>V-L~r[w|pz;H1`&5#b$BVW-$H^Sj:uA}<dv;=.-S]&m3F(Y.');
define('AUTH_SALT',        'lwX=>`$jgoY6ZAxUHGPPwu|]x&TkTch8/z=yaIm6y6YUHO )xdmr.z+&3S%%blWR');
define('SECURE_AUTH_SALT', '6qxr;+Zx)2D>x?TC-[gM~hmh9lb~1*gujc:!eS%*!R^nS%{_$4.i3J33!k:rK~zS');
define('LOGGED_IN_SALT',   'l,q^g1/W-vx#m*}GAArH:C^iz(}BE##|f;@<(BOlSFL Q&b5ZxWPC]aSdpxdlcI6');
define('NONCE_SALT',       '_?Dac4-]cDsidIodl|Lw^8u(ITKq9Xvj[v]:{Sc k`]$wyX?hsGL2:Dew3XCUYZY');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_pbl_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

define('WP_ALLOW_REPAIR', true);


/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
