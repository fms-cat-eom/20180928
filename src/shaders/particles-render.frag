#define PI 3.14159265
#define TAU 6.28318531
#define saturate(i) clamp(i,0.,1.)

// ------

#extension GL_EXT_draw_buffers : require
precision highp float;

varying vec3 vPos;
varying vec3 vNor;
varying vec3 vCol;
varying float vLife;

uniform mat4 matPL;
uniform mat4 matVL;

uniform vec3 cameraPos;
uniform float perspFar;
uniform vec3 lightPos;

uniform bool isShadow;

uniform sampler2D samplerShadow;

// == nande ====================================================================
vec3 rgb2yuv( vec3 rgb ) {
  return vec3(
    0.299 * rgb.x + 0.587 * rgb.y + 0.114 * rgb.z,
    -0.148736 * rgb.x - 0.331264 * rgb.y + 0.5 * rgb.z,
    0.5 * rgb.x - 0.418688 * rgb.y - 0.081312 * rgb.z
  );
}

vec3 hsv2rgb( vec3 hsv ) {
  float h = 6.0 * hsv.x;
  float c = hsv.y;
  float x = c * ( 1.0 - abs( mod( h, 2.0 ) - 1.0 ) );
  return saturate( hsv.z - c + (
    h < 1.0 ? vec3( c, x, 0.0 ) :
    h < 2.0 ? vec3( x, c, 0.0 ) :
    h < 3.0 ? vec3( 0.0, c, x ) :
    h < 4.0 ? vec3( 0.0, x, c ) :
    h < 5.0 ? vec3( x, 0.0, c ) :
              vec3( c, 0.0, x )
  ) );
}

// == rotate ===================================================================
mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

// == uh =======================================================================
float shadow( float d ) {
  vec4 pl = matPL * matVL * vec4( vPos, 1.0 );
  vec2 uv = pl.xy / pl.w * 0.5 + 0.5;

  float dc = length( vPos - lightPos );
  float ret = 0.0;
  for ( int iy = -1; iy <= 1; iy ++ ) {
    for ( int ix = -1; ix <= 1; ix ++ ) {
      vec2 uv = uv + vec2( float( ix ), float ( iy ) ) * 4E-4;
      float proj = texture2D( samplerShadow, uv ).x;
      float bias = 0.1 + ( 1.0 - d ) * 0.3;

      float dif = smoothstep( bias * 2.0, bias, ( dc - proj ) );
      ret += dif / 9.0;
    }
  }
  return ret;
}

// == main procedure ===========================================================
void main() {
  if ( vLife <= 0.0 ) { discard; }

  if ( isShadow ) {
    float depth = length( vPos - lightPos );
    gl_FragData[ 0 ] = vec4( depth, 0.0, 0.0, 1.0 );
    return;
  }

  vec3 lightDir = normalize( vPos - lightPos );
  vec3 rayDir = normalize( vPos - cameraPos );
  float d = dot( -vNor, lightDir );
  float dif = mix( 1.0, d, 0.5 );
  vec3 col = dif * vCol;

  float shadowFactor = shadow( d );
  col *= mix( 0.2, 1.0, shadowFactor );
  col = max( vec3( 0.0 ), col );

  gl_FragData[ 0 ] = vec4( hsv2rgb( rgb2yuv( col ) ), 1.0 );
  gl_FragData[ 1 ] = vec4( length( cameraPos - vPos ), 0.0, 0.0, 1.0 );
}