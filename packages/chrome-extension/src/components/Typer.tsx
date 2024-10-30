import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

export const Typer = ({originalText,onNextText} :{
    originalText: string;
    onNextText: () => void;
}) => {
    const [inputText, setInputText] = useState('');
    const [morph, setMorph] = useState(0);
    const [cooldown, setCooldown] = useState(0.5);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingSound = new Audio('/short-typing.mp3'); // Ensure you have a typing sound file

    const morphTime = 12;
    const cooldownTime = 0.5;

    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
        setShouldAnimate(true);
        setMorph(0);
        setCooldown(cooldownTime);
    }, [originalText]);

    useEffect(() => {
        if (!shouldAnimate) return;

        let animationFrameId: number;

        const update = () => {
            if (cooldown > 0) {
                setCooldown(prevCooldown => prevCooldown - 0.1);
            } else {
                setMorph(prevMorph => prevMorph + 0.1);
                if (morph >= morphTime) {
                    setShouldAnimate(false);
                    setCooldown(cooldownTime);
                    setMorph(morphTime);
                }
            }
            animationFrameId = requestAnimationFrame(update);
        };

        animationFrameId = requestAnimationFrame(update);

        return () => cancelAnimationFrame(animationFrameId);
    }, [morph, cooldown, shouldAnimate]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.value.length > originalText.length) {
            return;
        }
        setInputText(event.target.value);
        typingSound.play();
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const fraction = morph / morphTime;

    return (
        <div className='text-gray-300 flex flex-col items-center justify-center gap-[24px]'>
            <h1 className='font-mono text-[30px] animate-ripple'>
                <span style={{
                    filter: `blur(${Math.min(8 / fraction - 8, 100)}px)`,
                    opacity: `${Math.pow(fraction, 0.4) * 100}%`
                }}>
                    {originalText}
                </span>
            </h1>
            <input 
                ref={inputRef}
                type="text" 
                value={inputText} 
                onChange={handleInputChange} 
                tabIndex={-1}
                className='absolute left-[-9999px]'
            />
            <div className='flex gap-[5px]' onClick={()=>{
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }}  >
                {originalText.split('').map((char, index) => (
                    <div 
                        key={index} 
                        className={classNames(
                            "w-[10px] font-mono h-[30px] border-b-solid border-b-black border-b-[1px]", 
                            { 
                                "animate-bounce": inputText[index], 
                                "text-red-500": inputText[index] && inputText[index] !== char, // Add red color if not matching
                                "animate-blink": index === inputText.length, // Add blinking cursor at the next position
                                
                            }
                        )}
                    >
                        {inputText[index] || (index === inputText.length ? '|' : '')}
                    </div>
                ))}
            </div>
            <div className='flex justify-center items-center gap-[12px]'>
                <button 
                    tabIndex={-1}
                    onClick={onNextText}>Next</button>
                {originalText === inputText && (
                    <button 
                        tabIndex={-1}
                        onClick={onNextText}>Like</button>
                )}    
            </div>
            
        </div>
    );
};