import React from "react";
import { Box, Typography, Button } from "@mui/material";

const SubTitle = ({ title, btnTitle }) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      pt={4}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          color: "var(--color-text-dark)",
          "&:hover": {
            color: "var(--color-highlight-yellow)",
          },
          fontSize: "25px",
          cursor: "pointer",
        }}
      >
        {title}
      </Typography>

      {btnTitle && (
        <Button
          variant="contained"
          sx={{
            backgroundColor: "var(--color-brand-primary)",
            color: "var(--color-text-light)",
            borderRadius: "12px",
            textTransform: "none",
            px: 3,
            "&:hover": {
              backgroundColor: "var(--color-brand-secondary)",
            },
          }}
        >
          {btnTitle}
        </Button>
      )}
    </Box>
  );
};

export default SubTitle;
