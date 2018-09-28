#define PI 3.14159265
#define TAU 6.28318531
#define lofi(i,m) (floor((i)/(m))*(m))

precision highp float;

uniform float time;
uniform vec2 resolution;
uniform sampler2D sampler0;

float fractSin( float i ) {
  return fract( sin( i ) * 1846.42 );
}

void main() {
  vec2 uv = vec2( 0.0, 1.0 ) + vec2( 1.0, -1.0 ) * gl_FragCoord.xy / resolution;

  float deform = 1.0 - 2.0 * fractSin( sin( lofi( time * TAU + 40.0 * ( uv.x + uv.y ), 1.0 ) ) );
  deform = 0.005 * sign( deform ) * pow( abs( deform ), 10.0 );

  vec3 col = vec3(
    texture2D( sampler0, uv + deform ).y,
    texture2D( sampler0, uv + 2.0 * deform ).y,
    texture2D( sampler0, uv + 3.0 * deform ).y
  );
  float border = max(
    texture2D( sampler0, uv + deform ).x,
    max(
      texture2D( sampler0, uv + 2.0 * deform ).x,
      texture2D( sampler0, uv + 3.0 * deform ).x
    )
  );

  gl_FragColor = vec4( col, col + 0.5 * border );
}