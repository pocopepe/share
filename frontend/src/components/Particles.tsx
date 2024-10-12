import React from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const ParticlesBackground: React.FC = () => {
  const particlesInit = async (main: any) => {
    await loadFull(main);
  };

  const particlesOptions = {
    autoPlay: true,
    background: {
      color: {
        value: "#043564",
      },
      image: "url('https://vincentgarreau.com/particles.js/assets/img/kbLd9vb_new.gif')",
      position: "0 50%",
      repeat: "no-repeat",
      size: "60%",
      opacity: 1,
    },
    fullScreen: {
      enable: true,
      zIndex: 0,
    },
    detectRetina: true,
    fpsLimit: 120,
    interactivity: {
      detectsOn: "window",
      events: {
        onClick: {
          enable: true,
          mode: "repulse",
        },
        onHover: {
          enable: false,
        },
        resize: {
          delay: 0.5,
          enable: true,
        },
      },
      modes: {
        repulse: {
          distance: 200,
          duration: 0.4,
        },
        push: {
          quantity: 4,
        },
      },
    },
    particles: {
      number: {
        value: 100,
      },
      color: {
        value: "#ffffff",
      },
      shape: {
        type: "star",
        options: {
          star: {
            sides: 5,
          },
        },
      },
      opacity: {
        value: 0.5,
      },
      size: {
        value: { min: 1, max: 4 },
      },
      move: {
        enable: true,
        speed: 6,
        direction: "left",
        outModes: {
          default: "out",
        },
      },
    },
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesOptions}
    />
  );
};

export default ParticlesBackground;
