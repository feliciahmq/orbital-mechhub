import React, {useState } from "react";
import { FaBars } from "react-icons/fa";

import Format from "../../components/format/Format";
import './KeyboardGuide.css';

function KeyboardGuidePage() {
    const [navigationOpen, setNavigationOpen] = useState(false);

    const openNavigation = () => {
        setNavigationOpen(!navigationOpen);
    }

    return(
        <Format content={
            <div className="keyboard-guide">
                <FaBars style={{cursor: 'pointer'}} onClick={openNavigation}/>
                {navigationOpen && (
                    <div className="divbar">
                        <a href="#key-parts">Parts</a>
                        <a href="#switches">Switches</a>
                        <a href="#stabilisers">Stabilisers</a>
                        <a href="#keycaps">Keycaps</a>
                        <a href="#plate">Plate</a>
                        <a href="#pcb">PCB</a>
                        <a href="#case">Case</a>
                        <a href="#custom">Customisation</a>
                        <a href="#modding">Modding</a>
                    </div>
                )}
                <div id="intro">
                    <div className="guide-header">
                        <h1>(Mehcanical) Keyboards Are Great</h1>
                        <p>written by Vanessa + Gemini AI</p>
                    </div>
                    <p>Mechanical keyboards offer a truly unique typing experience, distinct from the mushy feel of standard membrane keyboards. Their responsiveness, durability, and satisfying keystroke sounds make them stand out. But what exactly sets them apart? Let's delve into the components and discover why you might be drawn to the world of mechanical keyboards.</p>
                    <p>Do note that, the following content contains some of my biased opinions ┏ʕ •ᴥ•ʔ┛. But as with everything, taste is subjective.</p>
                </div>

                <h2 id="key-parts">The 'Key' Parts</h2>
                <div id="switches" className='switches'>
                    <h3>Switches</h3>
                    <p>Ah yes, my favourite topic when it comes to keyboards. ʕ ꈍᴥꈍʔ</p>
                    <p>The heart of the keyboard. Each key sits on a switch, which registers your keypress. They come in various types, offering different typing feels (clicky, tactile, or linear) and actuation forces (how much pressure to register a keypress).</p>
                    
                    <h4>Linear Switches</h4>
                    <p>My Personal Favourite and is a switch that I recommend everyone starts with ʕ•ᴥ•ʔっ.</p>
                    <p>As simple as it gets, linear switches will feel the same from the start until bottoming out, meaning a smooth feel with no tactile bumps.</p>
                    <p><b>Popular Linear Switches:</b> Gateron Yellow, Cherry MX Red, Akko Piano Pros (Recommended!), Gateron Oil King</p>
                    
                    <h4>Tactile Switches</h4>
                    <p>Tactile switches have a little bump at the actuation point, which makes it a nice, responsive switch. These switches are fun to press, with the tactile bump without the sometimes annoyingly click sounds of clicky switches.</p>
                    <p><b>Popular Tactile Switches:</b> Akko Cream Blue V3, Glorious Holy Pandas, Gazzew Boba U4T</p>
                    
                    <h4>Clicky Switches</h4>
                    <p>Loud and Tactile, Clicky switches are popular amongst gaming keyboards. Clicky switches have a physical click jacket which gives them that audible 'click' sound. I would not recommend this switch for anyone in an office environment as they often are considered 'annoying'. ᶘಠᴥಠᶅ</p>
                    <p><b>Popular Clicky Switches:</b> Kailh Box Jade, Kailh Box Navy, Cherry MX Blue</p>
                    
                    <h4>Silent Switches</h4>
                    <p>While not technically a type of switch, it will fall into one of the three abovementioned types. It is worth mentioning as this type of switch is up and coming in popularity, especially among office workers, as it still provides a unique, smooth typing experience while not distracting anyone else.</p>
                    <p><b>Popular Silent Switches:</b> Kailh Midnight, Outemu Silent Cream Yellow, Gazzew Boba U4</p>
                </div>

                <div id="stabilisers" className='stabilisers'>
                    <h3>Stabilisers</h3>
                    <p>Stabilisers are an essential part of the keyboard, usually found under larger keys such as backspace, shift, and spacebar. They prevent the keyboard from shaking or rattling while typing. There are three common types of stabilisers: Cherry, Costar, and Optical. But I will only talk about Cherry as they are the most common ones and preferred amongst enthusiasts in the hobby.</p>
                    <p>Cherry Stabilisers are named after their shape, which is that of a Cherry MX switch stem. They are easy to mod and have many different options on the market. Cherry Stabilisers comprise 3 main components: stabiliser housing, bar and insert, Where the bar will keep the key from tilting when typing. They usually come in a few mounting types: plate-mounted, screw-in (recommended!) and clip-in.
                        <br />ʕ◉ᴥ◉ʔ
                    </p>
                    <p>Plate-mounted stabilisers are attached to the plate instead of the PCB. However, this may cause more rattling when typing,</p>
                    <p>Screw-in are stabilisers that are directly mounted to the PCB using screws, allows the stabilisers to be more secure and have less rattling,</p>
                    <p>Clip-ins are also mounted directly onto the PCB and are easier to install, but they are a bit less secure and far less common than their screw-in counterparts.</p>
                    <p>Now, it is important to clip and lube stabilisers to allow them to function as intended; otherwise, there will be rattling. (Although most stabilisers are already cliped nowadays)</p>
                    <p>Nowadays, most mechanical keyboard builds will come with stabilisers (which are usually pretty decent!). However, here are some popular stabilisers that you can consider switching to: Durock Stabilisers, GMK Stabilisers, EverGlide</p>
                </div>

                <div id="keycaps" className='keycaps'>
                    <h3>Keycaps</h3>
                    <p>There are 2 main things to consider when picking keycaps: material and profile. \ʕ •ᴥ•ʔ
                        <br /> I will go through the most popular options for each category
                    </p>
                    <h4>Material</h4>
                    <p><b>ABS (Acrylonitrile Butadiene Styrene):</b> The most common and affordable option. ABS keycaps offer a smooth feel and vibrant colours but can become shiny and greasy over time. They may also wear down faster with frequent use.</p>
                    <p><b>PBT (Polybutylene Terephthalate):</b> A more premium and durable material. PBT keycaps have a textured feel, resist shine and wear, and produce a deeper, thoccier typing sound. However, they can be slightly more expensive than ABS and may have a limited colour selection compared to ABS.</p>
                    <p>Another common term you'll hear when talking about plastic keycaps is single shot and double shot. To put it simply, single shot keycaps are made from 1 layer of plastic while double shot keycaps are 2 layers of plastic that are molded together which means that double shot is usually more expensive but also more durable.</p>
                    <p><b>POM (Polyoxymethylene):</b> A high-end material known for its incredibly smooth texture and exceptional wear resistance. POM keycaps are slippery and may not be for everyone, especially gamers who need more grip. They are also considered a more expensive option.</p>
                    <p><b>Ceramic:</b> Arguably the most high-end material readily available for the consumer market. Ceramic Keycaps boast a deep, clacky sound signature and a high-end feel. Despite being made of ceramic, the keycaps are also durable and long-lasting. ʕ•͡-•ʔ</p>
                    <h4>Profile</h4>
                    <p>The profile refers to the shape and height of the keycaps. It significantly impacts typing comfort, sound, and aesthetics.</p>
                    <p>Cherry Profile: A widely used, versatile profile with a medium height and slightly sculpted rows. It offers a good balance of comfort and typing accuracy.</p>
                    <p>OEM Profile: Similar to Cherry profile but slightly taller. Popular on pre-built keyboards, it provides a comfortable typing experience for many users.</p>
                </div>

                <div id="plate" className='plate'>
                    <h3>Plate</h3>
                    <p>A metal or plastic layer that stabilises the switches beneath the keycaps. It also affects the typing sound and the overall typing experience.</p>
                    <p>I will not discuss each material in detail ʕ – ᴥ – ʔ, but here are some popular ones: polycarbonate (PC), FR4, aluminium, and carbon fibre. Different plates have different amounts of 'flexibility' and sound signature.
                    <br />It is also increasingly common to see gasket-mounted plates that aim to improve typing feel and sound, providing additional cushioning, 'flexibility', and dampening in keyboards.
                    </p>
                </div>

                <div id="pcb" className='pcb'>
                    <h3>Printed Circuit Board (PCB)</h3>
                    <p>The brain of the keyboard. It holds the electrical components that connect the switches to your computer.</p>
                    <p>PCBs can be either soldered or hot-swappable. I recommend hot-swappable PCBs as they allow you to change switches whenever you like, whereas soldered PCBs require knowledge of how to solder and don't allow you to change switches once soldered.</p>
                    <p>Another term you will see often when selecting PCBs is 'flex-cut'. 
                        <br />These supposedly soften the bottom-out feeling typically experienced with 'harder'builds however, it is to note that it will not severely affect your build quality (as some companies charge more for flex cuts)</p>
                    
                </div>

                <div id="case" className='case'>
                    <h3>Case</h3>
                    <p>The housing that holds all the other parts. It comes in various materials and designs, further affecting the typing sound and overall aesthetics.</p>
                    <p>Common materials of cases include aluminium, which is often associated with a thockier, more luxurious feeling build and plastic. Although up to preferrence and budget, I would still recommend aluminium (or metal in general) builds. (Unless you plan to bring the build around, metal can be quite heavy! ʕ ˶•⤙•˶ ʔ )</p>
                </div>
                <h2 id="custom">The Custom in Customisable...</h2>
                <div>
                    The beauty of mechanical keyboards is the level of customisation. You can swap switches, keycaps, and even the case to create a keyboard that perfectly suits your typing style and preferences. This tinkering and personalization fuel a passionate community of enthusiasts who love experimenting and sharing their creations.
                </div>
                <h3 id="modding">Modding</h3>
                    <p>
                        Modding a mechanical keyboard is a popular hobby among enthusiasts, allowing for personalization and optimization of the typing experience. This involves altering various components to enhance performance, sound, or aesthetics.
                        <br /> I will be covering 2 popular mods, the tape mod and damping.
                    </p>
                    <p><b>Tape Mod:</b>Tape MOD is a simplest method by simply putting 2 to 3 layers of painters tape on the back of your keyboard's PCB. It is important to only use painter tape as any others may be a fire hazard. The mod would allow a deeper sound when keys are press and is easy and cost efficient, making it one of the most popular mods in the hobby.</p>
                    <p><b>Damping:</b>Damping is a general term referred to reducing noise made by a keyboard. There are various ways to do it either by modding the switches, PCB or plate. You can read more about various damping methods <a href='https://deskthority.net/wiki/Damping'>here</a></p>
                
                <h2 id="conclusion">Conclusively?</h2>
                    <p>Well I hope you learned something from that it took me a bit of time to write ʕง•ᴥ•ʔง (credits to Gemini AI for the section on keycaps, plates and mods)
                        <br />Perhaps you'll be diving into the world of mechanical keyboards soon. Who knows, maybe you'll be sharing my own modding adventures in the future! (in the forum ofc)
                    </p>
            </div>
        } />
    )
}

export default KeyboardGuidePage;