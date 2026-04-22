<?php
/**
 * Plugin Name: Blockto Auth0 User Bridge
 * Description: REST API endpoints for Auth0→WordPress user sync.
 * Version: 1.0.0
 *
 * DROP THIS FILE INTO: /wp-content/mu-plugins/blockto-auth-plugin.php
 */

add_action( 'rest_api_init', function () {

  // GET /wp-json/blockto/v1/users/by-auth0?auth0_id=auth0|xxx
  register_rest_route( 'blockto/v1', '/users/by-auth0', [
    'methods'             => 'GET',
    'callback'            => 'blockto_get_user_by_auth0_id',
    'permission_callback' => 'blockto_require_admin',
    'args'                => [
      'auth0_id' => [ 'required' => true, 'sanitize_callback' => 'sanitize_text_field' ],
    ],
  ] );

  // POST /wp-json/blockto/v1/users/{id}/meta
  register_rest_route( 'blockto/v1', '/users/(?P<id>\d+)/meta', [
    'methods'             => 'POST',
    'callback'            => 'blockto_set_user_meta',
    'permission_callback' => 'blockto_require_admin',
    'args'                => [
      'id'       => [ 'required' => true, 'validate_callback' => 'is_numeric' ],
      'auth0_id' => [ 'required' => true, 'sanitize_callback' => 'sanitize_text_field' ],
    ],
  ] );
} );

function blockto_require_admin(): bool {
  return current_user_can( 'manage_options' );
}

function blockto_get_user_by_auth0_id( WP_REST_Request $req ): WP_REST_Response|WP_Error {
  $auth0_id = $req->get_param( 'auth0_id' );

  $users = get_users( [
    'meta_key'   => 'auth0_id',
    'meta_value' => $auth0_id,
    'number'     => 1,
  ] );

  if ( empty( $users ) ) {
    return new WP_Error( 'not_found', 'User not found', [ 'status' => 404 ] );
  }

  $user = $users[0];
  return rest_ensure_response( [
    'id'       => $user->ID,
    'username' => $user->user_login,
    'email'    => $user->user_email,
    'name'     => $user->display_name,
    'meta'     => [ 'auth0_id' => $auth0_id ],
  ] );
}

function blockto_set_user_meta( WP_REST_Request $req ): WP_REST_Response|WP_Error {
  $user_id  = (int) $req->get_param( 'id' );
  $auth0_id = $req->get_param( 'auth0_id' );

  if ( ! get_user_by( 'id', $user_id ) ) {
    return new WP_Error( 'not_found', 'User not found', [ 'status' => 404 ] );
  }

  update_user_meta( $user_id, 'auth0_id', $auth0_id );

  return rest_ensure_response( [ 'ok' => true, 'user_id' => $user_id ] );
}
