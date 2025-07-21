/**
=========================================================
* Material Kit 2 React - v2.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-pro-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { forwardRef } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// Custom styles for MKButton
import MKButtonRoot from "components/MKButton/MKButtonRoot";

const MKButton = forwardRef(
  ({ color, variant, size, circular, iconOnly, children, ...rest }, ref) => {
    // Debug logging to catch problematic props
    if (typeof color !== 'string' && color !== undefined) {
      console.warn('MKButton received non-string color:', color, typeof color);
    }
    if (typeof variant !== 'string' && variant !== undefined) {
      console.warn('MKButton received non-string variant:', variant, typeof variant);
    }
    if (typeof size !== 'string' && size !== undefined) {
      console.warn('MKButton received non-string size:', size, typeof size);
    }

    // Convert custom colors to valid MUI Button colors
    const getMuiColor = (customColor) => {
      // Handle undefined, null, or empty string
      if (!customColor || typeof customColor !== 'string') {
        return "default";
      }
      
      switch (customColor) {
        case "white":
        case "light":
        case "dark":
          return "default";
        case "info":
        case "success":
        case "warning":
        case "error":
        case "primary":
        case "secondary":
          return customColor;
        default:
          return "default";
      }
    };

    return (
      <MKButtonRoot
        {...rest}
        ref={ref}
        color={getMuiColor(color)}
        variant={variant === "gradient" ? "contained" : (variant || "contained")}
        size={typeof size === 'string' ? size : "medium"}
        ownerState={{ color, variant, size, circular, iconOnly }}
      >
        {children}
      </MKButtonRoot>
    );
  }
);

// Setting default values for the props of MKButton
MKButton.defaultProps = {
  size: "medium",
  variant: "contained",
  color: "white",
  circular: false,
  iconOnly: false,
};

// Typechecking props for the MKButton
MKButton.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["text", "contained", "outlined", "gradient"]),
  color: PropTypes.oneOf([
    "default",
    "white",
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  circular: PropTypes.bool,
  iconOnly: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default MKButton;
