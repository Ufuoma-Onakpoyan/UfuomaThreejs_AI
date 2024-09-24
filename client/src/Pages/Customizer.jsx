import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { useSnapshot } from "valtio";
import config from '../config/config';
import state from '../Store';
import { download, logoShirt, stylishShirt } from "../assets"
import { downloadCanvasToImage, reader } from '../config/helpers';
import { EditorTabs, FilterTabs, DecalTypes } from '../config/constants';
import { fadeAnimation, slideAnimation } from '../config/motion';
import { AiPicker, ColorPicker, CustomButton, FilePicker, Tab } from "../Components"

const Customizer = () => {
  const snap = useSnapshot(state);

  const [file, setFile] = useState("")

  const [prompt, setPrompt] = useState('')

  const [generatingImg, setgeneratingImg] = useState(false)

  const [activeEditorTab, setactiveEditorTab] = useState("")

  const [activeFilterTab, setactiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false,
  })

  // show tab content depending on the active Tab
  const generateTabContent = () => {
    switch (activeEditorTab) {
      case "colorpicker":
        return <ColorPicker />
      case "filepicker":
        return <FilePicker
          file= {file}
          setFile = {setFile}
          readFile= {readFile}
        />
      case "aipicker":
        return <AiPicker
          prompt= {prompt}
          setPrompt = {setPrompt}
          generatingImg = {generatingImg}
          handleSubmit ={handleSubmit} 
        />
      default:
        return null;
    }
  }

  const handleSubmit = async (type) => {
    if(!prompt) return alert("Please enter a prompt")
  
    try {
      setgeneratingImg(true);
  
      const response = await fetch('https://ufuomathreejs-ai-1.onrender.com/api/v1/stable-diffusion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
        })
      })
  
      const data = await response.json();
      
      handleDecals(type, `data:image/png;base64,${data.photo}`)
    } catch (error) {
      alert(error)
    } finally {
      setgeneratingImg(false)
      setactiveEditorTab("")
    }
  }

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type];

    state[decalType.stateProperty] = result;

    if(!activeFilterTab[decalType.FilterTabs]){
      handleActiveFilterTab(decalType.FilterTabs)
    }
  }

  const handleActiveFilterTab = (tabname) => {
    switch (tabname) {
      case "logoShirt":
        state.isLogoTexture = !activeFilterTab[tabname];
       break;
      case "stylishShirt":
        state.isFullTexture = !activeFilterTab[tabname];
        break
      default:
        state.isFullTexture = false;
        state.isLogoTexture = true;
        break;
    }

    setactiveFilterTab((prevState) => {
      return {
        ...prevState,
        [tabname]: !prevState[tabname]
      }
    })
  }


  const readFile = (type) => {
    reader(file)
      .then((result) => {
        handleDecals(type, result);
        setactiveEditorTab("");
      })
  }
  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key="custom"
            className='absolute top-0 left-0 z-10'
            {...slideAnimation("left")}
          >
            <div className='flex items-center min-h-screen'>
              <div className='editortabs-container tabs '>
                {EditorTabs.map((tab) => (
                  <Tab 
                    key={tab.name}
                    tab = {tab}
                    handleClick={() => setactiveEditorTab(tab.name)}
                  />
                ))}

                {generateTabContent() }
              </div>
            </div>
          </motion.div>

          <motion.div
            className='absolute z-10 top-5 right-5'
            {...fadeAnimation}
          >
            <CustomButton
            type="filled"
            title="Go Back"
            handleClick={() => state.intro = true}
            customStyles="w-fit px-4 py-2.5 font-bold text-sm"
            />
          </motion.div>

          <motion.div
            className='filtertabs-container'
            {...slideAnimation("up")}
          >
            {FilterTabs.map((tab) => (
                  <Tab 
                    key={tab.name}
                    tab = {tab}
                    isFilterTab
                    isActiveTab={activeFilterTab[tab.name]}
                    handleClick={() => handleActiveFilterTab(tab.name)}
                  />
                ))}
            <button className='download-btn' onClick={downloadCanvasToImage}>
              <img
                src={download}
                alt='download_image'
                className='w-3/5 h-3/5 object-contain'
              />
            </button>
          </motion.div>
        </>
      ) }
    </AnimatePresence>
  )
}

export default Customizer
