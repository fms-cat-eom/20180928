import UltraCat from '../libs/ultracat';

// ------

export default ( context ) => {
  // == hi context =============================================================
  const glCatPath = context.glCatPath;
  const glCat = glCatPath.glCat;
  const gl = glCat.gl;

  const width = context.width;
  const height = context.height;

  const auto = context.automaton.auto;

  // == hi vbo =================================================================
  const vboQuad = glCat.createVertexbuffer( new Float32Array( UltraCat.triangleStripQuad ) );

  // == hi texture =============================================================
  const textureDiversity = glCat.createTexture();
  {
    const image = new Image();
    image.onload = () => {
      glCat.setTexture( textureDiversity, image );
    };
    image.src = require( '../images/diversity.png' );
  }

  // == path definition begin ==================================================
  glCatPath.add( {
    overlay: {
      vert: require( '../shaders/quad.vert' ),
      frag: require( '../shaders/overlay.frag' ),
      blend: [ gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA ],
      func: ( path, params ) => {
        glCat.attribute( 'p', vboQuad, 2 );
        glCat.uniformTexture( 'sampler0', textureDiversity, 0 );
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      }
    }
  } );

  if ( module.hot ) {
    module.hot.accept(
      [
        '../shaders/quad.vert',
        '../shaders/overlay.frag'
      ],
      () => {
        glCatPath.replaceProgram(
          'overlay',
          require( '../shaders/quad.vert' ),
          require( '../shaders/overlay.frag' )
        );
      }
    );
  }
};