import React from 'react';
import { Box, Typography, Container, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function FAQ() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default' }}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          FAQ & About SAMA
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          <b>SAMA (Solar Alone Multi-objective Advisor)</b> is an open-source (GNU GPL v3) energy system optimizer and analyzer mainly concentrated on stand-alone off-grid solar photovoltaic (PV)-based renewable energy systems (RES). SAMA allows for hybrid systems in locations that need a form of non-battery backup generation.
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1"><b>What is SAMA?</b></Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              SAMA (Solar Alone Multi-objective Advisor) is an open-source tool for optimizing and analyzing stand-alone off-grid solar PV-based renewable energy systems. It can also handle hybrid systems with non-battery backup generation.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1"><b>What can I do with SAMA?</b></Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              You can find the optimum size of a hybrid energy system for your property based on your electric load profile and local meteorological data (irradiation, temperature, wind speed). SAMA also provides economic data for your optimized system.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1"><b>What technologies and languages does SAMA use?</b></Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              SAMA is developed in Python 3.9 and uses libraries such as NumPy, Numba, time, pandas, math, matplotlib, and seaborn.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1"><b>Is SAMA free to use?</b></Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Yes! SAMA is open-source and licensed under the GNU GPL v3 license.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Container>
    </Box>
  );
}

export default FAQ;