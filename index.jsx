import React from "react";
import * as THREE from "three";
import TweenMax from "gsap/TweenMax";

class CircleMesh extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mesh: undefined
    };
  }

  init(colors) {
    var canvas = document.getElementById("mesh-circle-canvas");
    var width = canvas.offsetWidth,
      height = canvas.offsetHeight;

    var colors = (colors && colors.map(c => new THREE.Color(c))) || [
      new THREE.Color(0x4b2e83),
      new THREE.Color(0xe8e3d3),
      new THREE.Color(0x85754d)
    ];

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
    renderer.setSize(width, height);

    var scene = new THREE.Scene();

    var raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 6;

    var camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    camera.position.set(0, 0, 350);

    var galaxy = new THREE.Group();
    scene.add(galaxy);

    // Create dots
    var loader = new THREE.TextureLoader();
    loader.crossOrigin = "";
    var dotTexture = loader.load(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAz1BMVEX////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////LRjS1AAAARHRSTlMAAXQGVQ0Qf+1UxKXMkNth67fqI6StG/IzjPCE8e7XYFbVJI0dfcvjgMPY7Pnlpjsi4DrW2hweiQyPEoqLgdmI5PX63dUi/vUAAAFvSURBVHhepddnU/JAAATgvUgSUkFBqhQFewd7e9v+/9/0jiPjiIaQ3D7f72aSa7tYpRXsRweHbbJ9eBDtBy2U0pkM+c1w0kFBrrPLTLuOi/U8v8qVqr6HfGZUZ676yCDHXsi1wgZWquywgJ0KspkuC+oaZNiIWFi0kTF+kyVs/pjBNFlK02DZL5Z0jyUBS1tai6seS+td4ZM5poVjgwWMaKWGBW+LVrY8fPBpycc7PFRpqerinUNrDgCYG1pLDYAZBTMAjxQkAIYUnAC3lEwRUDJGn5I+tinZRkxJjHNKrtGm5BTUnMkTyJ8g/0R5GeWNpG/lsXqYppTcAScUvAFI1CvtkoJLACbVrnX9YYE7oKWBKz6uR+rz/oSFmhgwYEJaCA0+NWxCVgNfVMSYBzyzpBc56qphW437auEQK49cunKY2rraVzPI5x3lFc9Xr1D1nTPT3HFRUCdJ+U2adFBKK/Av4t9/+HfwL77wV9f//7ErSpBKzt70AAAAAElFTkSuQmCC"
    );
    var dotsAmount = 3000;
    var dotsGeometry = new THREE.Geometry();
    var positions = new Float32Array(dotsAmount * 3);

    var sizes = new Float32Array(dotsAmount);
    var colorsAttribute = new Float32Array(dotsAmount * 3);
    for (var i = 0; i < dotsAmount; i++) {
      var vector = new THREE.Vector3();

      vector.color = Math.floor(Math.random() * colors.length);
      vector.theta = Math.random() * Math.PI * 2;
      vector.phi =
        (((1 - Math.sqrt(Math.random())) * Math.PI) / 2) *
        (Math.random() > 0.5 ? 1 : -1);

      vector.x = Math.cos(vector.theta) * Math.cos(vector.phi);
      vector.y = Math.sin(vector.phi);
      vector.z = Math.sin(vector.theta) * Math.cos(vector.phi);
      vector.multiplyScalar(120 + (Math.random() - 0.5) * 5);
      vector.scaleX = 5;

      if (Math.random() > 0.5) {
        moveDot(vector, i);
      }
      dotsGeometry.vertices.push(vector);
      vector.toArray(positions, i * 3);
      colors[vector.color].toArray(colorsAttribute, i * 3);
      sizes[i] = 5;
    }

    function moveDot(vector, index) {
      var tempVector = vector.clone();
      tempVector.multiplyScalar((Math.random() - 0.5) * 0.2 + 1);
      TweenMax.to(vector, Math.random() * 3 + 3, {
        x: tempVector.x,
        y: tempVector.y,
        z: tempVector.z,
        yoyo: true,
        repeat: -1,
        delay: -Math.random() * 3,
        ease: Power0.easeNone,
        onUpdate: function() {
          attributePositions.array[index * 3] = vector.x;
          attributePositions.array[index * 3 + 1] = vector.y;
          attributePositions.array[index * 3 + 2] = vector.z;
        }
      });
    }

    var bufferWrapGeom = new THREE.BufferGeometry();
    var attributePositions = new THREE.BufferAttribute(positions, 3);
    bufferWrapGeom.addAttribute("position", attributePositions);
    var attributeSizes = new THREE.BufferAttribute(sizes, 1);
    bufferWrapGeom.addAttribute("size", attributeSizes);
    var attributeColors = new THREE.BufferAttribute(colorsAttribute, 3);
    bufferWrapGeom.addAttribute("color", attributeColors);
    var shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        texture: {
          value: dotTexture
        }
      },
      vertexShader: `
      attribute float size;
					attribute vec3 color;
					varying vec3 vColor;
					void main() {
						vColor = color;
						vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
						gl_PointSize = size * ( 350.0 / - mvPosition.z );
						gl_Position = projectionMatrix * mvPosition;
          }`,
      fragmentShader: `
      varying vec3 vColor;
					uniform sampler2D texture;
					void main(){
						vec4 textureColor = texture2D( texture, gl_PointCoord );
						if ( textureColor.a < 0.3 ) discard;
						vec4 color = vec4(vColor.xyz, 1.0) * textureColor;
						gl_FragColor = color;
					}`,
      transparent: true
    });
    var wrap = new THREE.Points(bufferWrapGeom, shaderMaterial);
    scene.add(wrap);

    // Create white segments
    var segmentsGeom = new THREE.Geometry();
    var segmentsMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      vertexColors: THREE.VertexColors
    });
    for (i = dotsGeometry.vertices.length - 1; i >= 0; i--) {
      vector = dotsGeometry.vertices[i];
      for (var j = dotsGeometry.vertices.length - 1; j >= 0; j--) {
        if (i !== j && vector.distanceTo(dotsGeometry.vertices[j]) < 12) {
          segmentsGeom.vertices.push(vector);
          segmentsGeom.vertices.push(dotsGeometry.vertices[j]);
          segmentsGeom.colors.push(colors[vector.color]);
          segmentsGeom.colors.push(colors[vector.color]);
        }
      }
    }
    var segments = new THREE.LineSegments(segmentsGeom, segmentsMat);
    galaxy.add(segments);

    var hovered = [];
    var prevHovered = [];
    function render(a) {
      var i;
      dotsGeometry.verticesNeedUpdate = true;
      segmentsGeom.verticesNeedUpdate = true;

      raycaster.setFromCamera(mouse, camera);
      var intersections = raycaster.intersectObjects([wrap]);
      hovered = [];
      if (intersections.length) {
        for (i = 0; i < intersections.length; i++) {
          var index = intersections[i].index;
          hovered.push(index);
          if (prevHovered.indexOf(index) === -1) {
            onDotHover(index);
          }
        }
      }
      for (i = 0; i < prevHovered.length; i++) {
        if (hovered.indexOf(prevHovered[i]) === -1) {
          mouseOut(prevHovered[i]);
        }
      }
      prevHovered = hovered.slice(0);
      attributeSizes.needsUpdate = true;
      attributePositions.needsUpdate = true;
      renderer.render(scene, camera);
    }

    function onDotHover(index) {
      dotsGeometry.vertices[index].tl = new TimelineMax();
      dotsGeometry.vertices[index].tl.to(dotsGeometry.vertices[index], 1, {
        scaleX: 10,
        ease: Elastic.easeOut.config(2, 0.2),
        onUpdate: function() {
          attributeSizes.array[index] = dotsGeometry.vertices[index].scaleX;
        }
      });
    }

    function mouseOut(index) {
      dotsGeometry.vertices[index].tl.to(dotsGeometry.vertices[index], 0.4, {
        scaleX: 5,
        ease: Power2.easeOut,
        onUpdate: function() {
          attributeSizes.array[index] = dotsGeometry.vertices[index].scaleX;
        }
      });
    }

    function onResize() {
      canvas.style.width = "";
      canvas.style.height = "";
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    var mouse = new THREE.Vector2(-100, -100);
    function onMouseMove(e) {
      var canvasBounding = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - canvasBounding.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - canvasBounding.top) / height) * 2 + 1;
    }

    TweenMax.ticker.addEventListener("tick", render);
    window.addEventListener("mousemove", onMouseMove);
    var resizeTm;
    window.addEventListener("resize", function() {
      resizeTm = clearTimeout(resizeTm);
      resizeTm = setTimeout(onResize, 200);
    });
  }

  componentDidMount() {
    this.init(this.props.colors);
  }

  render() {
    return (
      <React.Fragment>
        <style>
          {`.mesh-circle-scene {
              position: absolute;
              z-index: -99;
              width: 100%;
              height: 100vh;
            }`}
        </style>
        <canvas className="mesh-circle-scene" id="mesh-circle-canvas" />
      </React.Fragment>
    );
  }
}

export default CircleMesh;
