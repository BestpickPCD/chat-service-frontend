import { Box, Container, CssBaseline, Grid, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

import { ReactNode } from "react";
import { useLocation } from "react-router";

const Wrapper = styled(Box)(
  () => `
    overflow: auto;
    flex: 1;
    overflow-x: hidden;
    display: flex;
    align-items: center;
    height: 100vh;
`
);

const AuthLayout = ({ children }: { children: ReactNode }): JSX.Element => {
  const location = useLocation();
  return (
    <Wrapper>
      <title>{location.pathname === "/register" ? "Sign Up" : "Sign In"}</title>
      <Container component="main" maxWidth="lg">
        <Box>
          <Grid container>
            <CssBaseline />
            <Grid
              item
              xs={false}
              sm={4}
              md={7}
              sx={{
                backgroundImage: "url(https://source.unsplash.com/random)",
                backgroundRepeat: "no-repeat",
                backgroundColor: (t) =>
                  t.palette.mode === "light"
                    ? t.palette.grey[50]
                    : t.palette.grey[900],
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "80vh",
              }}
            />
            <Grid
              item
              xs={12}
              sm={8}
              md={5}
              component={Paper}
              elevation={6}
              square
            >
              <Box
                sx={{
                  mx: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  justifyContent: "center",
                }}
              >
                {children}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Wrapper>
  );
};

export default AuthLayout;
