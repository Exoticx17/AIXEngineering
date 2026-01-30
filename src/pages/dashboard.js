import React, { useState, useRef } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie, PieChart } from 'recharts';
import '../stylesheets/dashboard.css'
import document from '../photos/document.png'
import user from '../photos/user.jpg'

const Dashboard = () => {

    const [submitted, setSubmitted] = useState(false);
    const [dataObj, setDataObj] = useState({});

    const safeNum = (v, decimals = 2) => {
    const n = Number(v);
    return Number.isFinite(n) ? Number(n.toFixed(decimals)) : 0;
    };


    const onSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        const inpObject = {
            projectName: e.target.pName.value,
            primaryTechnology: e.target.pTech.value,
            projectDescription: e.target.pDesc.value,
            movingParts: parseFloat(e.target.pMovPart.value),
            forceTorque: parseFloat(e.target.pForceTorque.value),
            weightConstraints: parseFloat(e.target.pWeightConstr.value),
            electronicsComplexity: parseFloat(e.target.pElecComp.value),
            powerConsumption: parseFloat(e.target.pPowCons.value),
            softwareComplexity: parseFloat(e.target.pSoftComp.value),
            materialDifficulty: parseFloat(e.target.pMatDiff.value),
            chemicalFluids: parseFloat(e.target.pChemFluids.value),
            structuralLoad: parseFloat(e.target.pStructLoad.value),
            aerodynamics: parseFloat(e.target.pAero.value),
            environmentalConstraints: parseFloat(e.target.pEnvConstr.value)
        };
        console.log("InpOBJ:", inpObject);
        try {
            const res = await axios.post(
                'http://localhost:1700/model/predict_eng',
                inpObject
            );
            setDataObj(res.data);
            console.log("DataOBJ:", res.data);
            } catch (err) {
                console.error("Prediction error:", err);
            }
    }

    const contributionsData = [
        { name: 'Aerospace', value: Math.abs(parseFloat(dataObj.predictedaerospacecontributions)).toFixed(2) || 0 },
        { name: 'Chemical', value: Math.abs(parseFloat(dataObj.predictedchemicalcontributions)).toFixed(2) || 0 },
        { name: 'Civil', value: Math.abs(parseFloat(dataObj.predictedcivilcontributions)).toFixed(2) || 0 },
        { name: 'Computer', value: Math.abs(parseFloat(dataObj.predictedcomputercontributions)).toFixed(2) || 0 },
        { name: 'Electrical', value: Math.abs(parseFloat(dataObj.predictedelectricalcontributions)).toFixed(2) || 0 },
        { name: 'Environmental', value: Math.abs(parseFloat(dataObj.predictedenvironmentalcontributions)).toFixed(2) || 0 },
        { name: 'Industrial', value: Math.abs(parseFloat(dataObj.predictedindustrialcontributions)).toFixed(2) || 0 },
        { name: 'Materials', value: Math.abs(parseFloat(dataObj.predictedmaterialscontributions)).toFixed(2) || 0 },
        { name: 'Mechanical', value: Math.abs(parseFloat(dataObj.predictedmechanicalcontributions)).toFixed(2) || 0 },
        { name: 'Software', value: Math.abs(parseFloat(dataObj.predictedsoftwarecontributions)).toFixed(2) || 0 }
    ];

    const complexity = safeNum(parseFloat(dataObj.predictedcomplexity || 0).toFixed(2));

    const complexityData = [
    { name: 'Complexity', value: complexity },
    { name: 'Remaining', value: 10 - complexity }
    ];

    return ( 
    <div className='dContainer'>
        <div className='dNavbar'>
            <h2 className='dHeader'>Dashboard</h2>
            <h2 className='dContrib'>Exoticx17</h2>
            <img src={user} alt="userLogo"  className='dUser'/>
            <img src={document} alt="documentLogo" className='dDoc'/>
        </div>
        <div className='dInput'>
            <p className='dPredHead'>Ready to predict engineering?</p>
            <form className='dForm' onSubmit={onSubmit}>
                <div className='dInps'>
                    <div className='dFirstInps'>
                        <input type="text" placeholder='Project Name' className='dInput1Box' name="pName"/>
                        <input type="text" placeholder='Primary Technology' className='dInput2Box' name="pTech"/>
                        <textarea placeholder='Project Description' className='dTextArea' name="pDesc"/>
                    </div>
                    <div className='dSecondInps'>
                        <input type="number" placeholder='Moving Parts' className='dInput3Box' name="pMovPart" min="0" max="10" step="0.01"/>
                        <input type="number" placeholder='Force Torque' className='dInput4Box' name="pForceTorque" min="0" max="10" step="0.01"/>
                        <input type="number" placeholder='Weight Constraints' className='dInput5Box' name="pWeightConstr" min="0" max="10" step="0.01"/>
                        <input type="number" placeholder='Electronics Complexity' className='dInput6Box' name="pElecComp" min="0" max="10" step="0.01"/>
                    </div>
                    <div className='dThirdInps'>
                        <input type="number" placeholder='Power Consumption' className='dInput7Box' name="pPowCons" min="0" max="10" step="0.01"/>
                        <input type="number" placeholder='Software Complexity' className='dInput8Box' name="pSoftComp" min="0" max="10" step="0.01"/>
                        <input type="number" placeholder='Materials Difficulty' className='dInput9Box' name="pMatDiff" min="0" max="10" step="0.01"/>
                        <input type="number" placeholder='Chemical Fluids' className='dInput10Box' name="pChemFluids" min="0" max="10" step="0.01"/>
                    </div>
                    <div className='dFourthInps'>
                        <input type="number" placeholder='Structural Load' className='dInput11Box' name="pStructLoad" min="0" max="10" step="0.01"/>
                        <input type="number" placeholder='Aerodynamics' className='dInput12Box' name="pAero" min="0" max="10" step="0.01"/>
                        <input type="number" placeholder='Environmental Constraints' className='dInput13Box' name="pEnvConstr" min="0" max="10" step="0.01"/>
                    </div>
                </div>
                <button type='submit' className='dSubmitBtn'>Submit</button>
            </form>
        </div>
        <div className='dOutput' style={submitted ? {display: 'block'} : {display: 'none'}}>
            <h3 className='projectPredHeader'>Project Predictions</h3>
            <p className='primaryFieldHead'>Primary Field of Engineering: {dataObj.predictedprimaryfield}</p>
            <div className='firstRow'>
            <div className='contributionsChart'>
                <h2 className='contributionsTitle'>Contributions Chart</h2>
                <BarChart width={1000} height={600} data={contributionsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap={15}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 14 }}/>
                    <YAxis domain={[0, 50]} ticks={[0, 10, 20, 30, 40, 50]}/>
                    <Tooltip />
                    <Bar dataKey="value" fill="rgb(0, 105, 131)" />
                </BarChart>
            </div>
            <div className='complexityChart'>
                <h2 className='complexityTitle'>Complexity</h2>
                <PieChart width={650} height={600}  margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap={15}>
                    <Tooltip />
                    <Pie
                        data={complexityData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={140}
                        fill="rgb(199, 179, 0)"
                        startAngle={180}
                        endAngle={0}
                        strokeWidth={3} 
                    />
                </PieChart>
            </div>
            </div>
        </div>
    </div> );
}
 
export default Dashboard;