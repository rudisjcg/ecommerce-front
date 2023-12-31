import React, { useContext, useRef } from "react";
import Button from "./Button";
import { CartContext } from "./CartContext";

const DEFAULT_TARGET_TOP = "5%",
  DEFAULT_TARGET_LEFT = "5%",
  DEFAULT_ANIMATION_DURATION = 0.9,
  DEFAULT_ITEM_STYLING = {
    borderRadius: "4rem",
    width: "8rem",
  };

export default function FlyingBtn({
  src = "",
  children,
  targetTop = DEFAULT_TARGET_TOP,
  targetLeft = DEFAULT_TARGET_LEFT,
  customAnimation = "",
  animationDuration = DEFAULT_ANIMATION_DURATION,
  flyingItemStyling = DEFAULT_ITEM_STYLING,
  _id,
  ...rest
}) {
  const { addProduct } = useContext(CartContext);
  const flyingImage = useRef(null);

  const initFlight = (e) => {
    flyingImage.current.style.setProperty(
      "--target-position-x",
      e.clientX + "px"
    );
    flyingImage.current.style.setProperty(
      "--target-position-y",
      e.clientY + "px"
    );
    flyingImage.current.style.setProperty("display", "");
    flyingImage.current.src = src;
    setTimeout(
      () => flyingImage.current.style.setProperty("display", "none"),
      animationDuration * 1000 - 100
    );
  };

  const customStyling = `
      .flying_image {
        --target-position-x: 0px;
        --target-position-y: 0px;
      
        display: block;
        position: fixed;
        top: var(--target-position-y);
        left: var(--target-position-x);
        translate: -50% -50%;
        animation: fly ${animationDuration}s 1;
      }
      @keyframes fly {
        0% {
          top: var(--target-position-y);
          left: var(--target-position-x);
          opacity: 1;
        }
        ${customAnimation}
        100% {
          top: ${targetTop};
          left: ${targetLeft};
          opacity: 0;
        }
      }
    `;

  return (
    <div onClick={() => addProduct(_id)}>
      <style>{customStyling}</style>
      <Button {...rest} onClick={(e) => initFlight(e)}>
        {children}
      </Button>
      <img
        src=""
        alt=""
        className="flying_image"
        style={{
          display: "none",
          ...DEFAULT_ITEM_STYLING,
          ...flyingItemStyling,
        }}
        ref={flyingImage}
      />
    </div>
  );
}
