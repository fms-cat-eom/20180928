precision highp float;

// == variables ================================================================
uniform vec2 resolutionMotion;
uniform vec2 planeResolution;
uniform float voxelUnit;

uniform sampler2D samplerMotion;

// == deal with motion field ===================================================
vec2 motionCoord( vec3 _v ) {
  vec3 v = floor( _v / voxelUnit ) + 0.5;
  vec2 planeSize = planeResolution / resolutionMotion;

  // == where are the plane origin? ============================================
  float zRange = floor( 1.0 / planeSize.x ) * floor( 1.0 / planeSize.y ) / 2.0;
  if ( v.z < -zRange || zRange < v.z ) {
    return vec2( 0.0, 0.0 );
  }
  float planeIndex = floor( v.z + zRange );
  vec2 planeOrigin = vec2( fract( planeIndex * planeSize.x ), floor( planeIndex * planeSize.x ) * planeSize.y );

  // == place a dot on the plane ===============================================
  vec2 xyRange = planeResolution / 2.0;
  if ( v.x < -xyRange.x || xyRange.x < v.x || v.y < -xyRange.y || xyRange.y < v.y ) {
    return vec2( 0.0, 0.0 );
  }
  return planeOrigin + ( v.xy + xyRange ) / planeResolution * planeSize;
}

vec3 motionCoordInv( vec2 _coord ) {
  vec2 planeSize = planeResolution / resolutionMotion;
  vec3 ret = vec3( 0.0 );

  // == x and y ================================================================
  ret.xy = ( ( fract( _coord / planeSize ) - 0.5 ) * planeResolution ) * voxelUnit;

  // == z ======================================================================
  float zRange = floor( 1.0 / planeSize.x ) * floor( 1.0 / planeSize.y ) / 2.0;
  vec2 planePlace = floor( _coord / planeSize );
  ret.z = ( planePlace.x + floor( planePlace.y / planeSize.x ) - zRange + 0.5 ) * voxelUnit;

  return ret;
}

// == main =====================================================================
void main() {
  vec2 uv = gl_FragCoord.xy / resolutionMotion;
  vec3 v = motionCoordInv( uv );

  vec2 d = vec2( 0.0, voxelUnit );

  vec4 center = texture2D( samplerMotion, uv );
  float xm = texture2D( samplerMotion, motionCoord( v - d.yxx ) ).x;
  float xp = texture2D( samplerMotion, motionCoord( v + d.yxx ) ).x;
  float ym = texture2D( samplerMotion, motionCoord( v - d.xyx ) ).y;
  float yp = texture2D( samplerMotion, motionCoord( v + d.xyx ) ).y;
  float zm = texture2D( samplerMotion, motionCoord( v - d.xxy ) ).z;
  float zp = texture2D( samplerMotion, motionCoord( v + d.xxy ) ).z;

  float divergence = xp - xm + yp - ym + zp - zm;
  divergence -= exp( ( center.w / 1000.0 - 20.0 ) );

  gl_FragColor = vec4( divergence, 0.0, 0.0, center.w );
}