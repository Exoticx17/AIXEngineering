const axios = require('axios');
const pool = require('../db');

const getLargest = (obj) => {
  const keys = Object.keys(obj);
  const values = Object.values(obj);
  const maxIndex = values.indexOf(Math.max(...values));
  return keys[maxIndex];
}

const getModelPredictions = async (req, res) => {
  const {
    movingParts,
    forceTorque,
    weightConstraints,
    electronicsComplexity,
    powerConsumption,
    softwareComplexity,
    materialDifficulty,
    chemicalFluids,
    structuralLoad,
    aerodynamics,
    environmentalConstraints,
    projectName,
    primaryTechnology,
    projectDescription
  } = req.body;

  // 🔒 Basic validation
  if (!projectName || !primaryTechnology || !projectDescription) {
    return res.status(400).json({ error: 'Missing required project fields' });
  }

  try {
    const flaskResponse = await axios.post(
      'http://127.0.0.1:5000/predict_eng',
      {
        MovingParts: movingParts,
        ForceTorque: forceTorque,
        WeightConstraints: weightConstraints,
        ElectronicsComplexity: electronicsComplexity,
        PowerConsumption: powerConsumption,
        SoftwareComplexity: softwareComplexity,
        MaterialDifficulty: materialDifficulty,
        ChemicalFluids: chemicalFluids,
        StructuralLoad: structuralLoad,
        Aerodynamics: aerodynamics,
        EnvironmentalConstraints: environmentalConstraints,
        ProjectName: projectName,
        PrimaryTechnology: primaryTechnology,
        ProjectDescription: projectDescription
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const {
      complexity = null,
      contributions = [],
      primary_field_probs = []
    } = flaskResponse.data || {};

    if (contributions.length !== 10 || primary_field_probs.length !== 10) {
      throw new Error('Invalid model output from Flask');
    }

    const contributionsObj = {
      Mechanical: contributions[0],
      Electrical: contributions[1],
      Civil: contributions[2],
      Chemical: contributions[3],
      Computer: contributions[4],
      Software: contributions[5],
      Aerospace: contributions[6],
      Materials: contributions[7],
      Environmental: contributions[8],
      Industrial: contributions[9]
    };

    const primaryFieldObj = {
      Mechanical: primary_field_probs[0],
      Electrical: primary_field_probs[1],
      Civil: primary_field_probs[2],
      Chemical: primary_field_probs[3],
      Computer: primary_field_probs[4],
      Software: primary_field_probs[5],
      Aerospace: primary_field_probs[6],
      Materials: primary_field_probs[7],
      Environmental: primary_field_probs[8],
      Industrial: primary_field_probs[9]
    };

    const primaryField = getLargest(primaryFieldObj);

    const result = await pool.query(
      `INSERT INTO models (
        ProjectName, PrimaryTechnology, ProjectDescription,
        MovingParts, ForceTorque, WeightConstraints,
        ElectronicsComplexity, PowerConsumption, SoftwareComplexity,
        MaterialDifficulty, ChemicalFluids, StructuralLoad,
        Aerodynamics, EnvironmentalConstraints,
        PredictedPrimaryField, PredictedComplexity,
        PredictedMechanicalContributions, PredictedElectricalContributions,
        PredictedCivilContributions, PredictedChemicalContributions,
        PredictedComputerContributions, PredictedSoftwareContributions,
        PredictedAerospaceContributions, PredictedMaterialsContributions,
        PredictedEnvironmentalContributions, PredictedIndustrialContributions
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25, $26
      )
      RETURNING *`,
      [
        projectName,
        primaryTechnology,
        projectDescription,
        movingParts,
        forceTorque,
        weightConstraints,
        electronicsComplexity,
        powerConsumption,
        softwareComplexity,
        materialDifficulty,
        chemicalFluids,
        structuralLoad,
        aerodynamics,
        environmentalConstraints,
        primaryField,
        complexity,
        contributionsObj.Mechanical,
        contributionsObj.Electrical,
        contributionsObj.Civil,
        contributionsObj.Chemical,
        contributionsObj.Computer,
        contributionsObj.Software,
        contributionsObj.Aerospace,
        contributionsObj.Materials,
        contributionsObj.Environmental,
        contributionsObj.Industrial
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Model prediction error:', error.message);
    res.status(500).json({ error: 'Error fetching model predictions' });
  }
};

const getReturnModelPredictions = async (req, res) => { 
  const { id } = req.params;
  try {
  const result = await pool.query(
      'SELECT * FROM models WHERE id = $1 ORDER BY created_at DESC LIMIT 1',
      [id]
    );
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching model predictions' });
}};

module.exports = {
  getModelPredictions,
  getReturnModelPredictions
};