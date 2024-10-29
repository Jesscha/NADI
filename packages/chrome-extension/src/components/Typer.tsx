import React, { useRef, useState } from 'react';
import './Typer.css'; // Import the CSS file for animations

export const Typer = () => {
    const [inputText, setInputText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const originalText = "Be an Ocean. Not a puddle";
    const typingSound = new Audio('/short-typing.mp3'); // Ensure you have a typing sound file

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value);
        typingSound.play();
    };

    const handleSpanClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className='text-red-600'>
            <h2>{originalText}</h2>
            <input 
                ref={inputRef}
                type="text" 
                value={inputText} 
                onChange={handleInputChange} 
                placeholder="Start typing here..."
                style={{ position: 'absolute', left: '-9999px' }} // Hide input off-screen
            />
            <div onClick={handleSpanClick} style={{ cursor: 'text', minHeight: '20px', display: 'inline-block' }}>
                {originalText.split('').map((char, index) => (
                    <div  key={index} className={inputText[index] ? 'bounce' : ''} style={{ marginRight: '5px'}}>
                        {inputText[index] || ""}
                    </div>
                ))}
            </div>
        </div>
    );
};