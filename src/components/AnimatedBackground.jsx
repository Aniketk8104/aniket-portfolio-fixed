import React, { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const AnimatedBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    console.log("Particles container loaded", container);
  }, []);

  return (
    <>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          fullScreen: {
            enable: false,
            zIndex: -1,
          },
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "grab",
              },
              resize: true,
            },
            modes: {
              grab: {
                distance: 140,
                links: {
                  opacity: 1,
                },
              },
              push: {
                quantity: 4,
              },
            },
          },
          particles: {
            color: {
              value: "#667eea",
            },
            links: {
              color: "#667eea",
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "out",
              },
              random: false,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.3,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 5 },
              random: true,
            },
          },
          detectRetina: true,
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      />

      {/* Background canvas */}
      <div
        className="bg-canvas"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          zIndex: -2,
        }}
      />

      {/* Floating shapes */}
      <div className="floating-shapes">
        <div
          className="shape"
          style={{
            position: "absolute",
            width: "20px",
            height: "20px",
            background: "rgba(102, 126, 234, 0.1)",
            borderRadius: "50%",
            animation: "float 6s ease-in-out infinite",
            top: "20%",
            left: "10%",
          }}
        />
        <div
          className="shape"
          style={{
            position: "absolute",
            width: "15px",
            height: "15px",
            background: "rgba(102, 126, 234, 0.1)",
            borderRadius: "50%",
            animation: "float 8s ease-in-out infinite reverse",
            top: "60%",
            right: "15%",
          }}
        />
        <div
          className="shape"
          style={{
            position: "absolute",
            width: "25px",
            height: "25px",
            background: "rgba(102, 126, 234, 0.1)",
            borderRadius: "50%",
            animation: "float 10s ease-in-out infinite",
            bottom: "20%",
            left: "60%",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
      `}</style>
    </>
  );
};

export default AnimatedBackground;
