import React from 'react'
import { 
  Typography, 
  Box, 
  Divider, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails 
} from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const faqData = [
  {
    question: "What is SAMA?",
    answer: "SAMA (Solar Alone Multi-objective Advisor) is an open-source tool for optimizing and analyzing stand-alone off-grid solar PV-based renewable energy systems. It can also handle hybrid systems with non-battery backup generation."
  },
  {
    question: "What can I do with SAMA?",
    answer: "You can find the optimum size of a hybrid energy system for your property based on your electric load profile and local meteorological data (irradiation, temperature, wind speed). SAMA also provides economic data for your optimized system."
  },
  {
    question: "What technologies and languages does SAMA use?",
    answer: "SAMA is developed in Python 3.9 and uses libraries such as NumPy, Numba, time, pandas, math, matplotlib, and seaborn."
  },
  {
    question: "Is SAMA free to use?",
    answer: "Yes! SAMA is open-source and licensed under the GNU GPL v3 license."
  }
];

function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="h3" component="h1" gutterBottom>
            FAQ & About SAMA
          </Typography>
          <Typography variant="body1" color="textSecondary">
            SAMA (Solar Alone Multi-objective Advisor) is an open-source (GNU GPL v3) energy system optimizer and analyzer mainly concentrated on stand-alone off-grid solar photovoltaic (PV)-based renewable energy systems (RES). SAMA allows for hybrid systems in locations that need a form of non-battery backup generation.
          </Typography>
        </div>

        <Divider sx={{ my: 4 }} />

        {/* FAQ Content */}
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {faqData.map((faq, index) => (
            <Accordion key={index} elevation={1} square>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}a-content`}
                id={`panel${index}a-header`}
              >
                <Typography variant="h6">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="textSecondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </div>
    </div>
  )
}

export default FAQ 