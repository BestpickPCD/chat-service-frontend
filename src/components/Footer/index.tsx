import { Box, Container, Typography, styled } from '@mui/material';

const FooterWrapper = styled(Container)(
  ({ theme }) => `
        margin-top: ${theme.spacing(4)};
`
);

const Footer = (): JSX.Element => (
  <FooterWrapper className="footer-wrapper">
    <Box
      pb={4}
      display={{ xs: 'block', md: 'flex' }}
      alignItems="center"
      textAlign={{ xs: 'center', md: 'left' }}
      justifyContent="space-between"
    >
      <Box>
        <Typography variant="subtitle1">&copy;Admin Dashboard</Typography>
      </Box>
      <Typography
        sx={{
          pt: { xs: 2, md: 0 }
        }}
        variant="subtitle1"
      >
        Crafted by BestPick Technology
      </Typography>
    </Box>
  </FooterWrapper>
);

export default Footer;
