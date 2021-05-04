import React from "react";
import { useFetch } from "./hooks/useFetch";
import { scaleLinear } from "d3-scale";
import { extent, max, min, bin } from "d3-array";
import * as topojson from "topojson-client";


const App = () => {

    /* THIS GOES IN APP.JS */  

    const [cardData, cardLoading] = useFetch(
        "https://raw.githubusercontent.com/ramirostUW/info474assignment2/main/cards.csv"
    );

    const chartSize = 500;
    const margin = 20;
    const histogramLeftPadding = 20;

    _bins = bin().thresholds(30);

    let monsterData = cardData.filter(card => !(card.atk === ""));
    let avgAtk = 0;
    monsterData.forEach(function(card){
        avgAtk = avgAtk + parseFloat(card.atk);
    })   
    avgAtk = avgAtk/monsterData.length;
    cardBins = _bins(
        monsterData.map((d) => {
            return +d.atk;
        })
    )
    //bar chart stuff
    let sortValues = function(myObject){
        let objectKeys = Object.keys(myObject);
        let sortedObject = {};
        objectKeys.sort(function(a,b) {
            return myObject[b] - myObject[a];
        });
        objectKeys.forEach(function(key){
            sortedObject[(key)] = myObject[key];
        });
        return sortedObject;
    }

    let attributeCounts = {};
    cardData.forEach((card) => {
        let attributeValue = card.attribute;
        if(card.attribute === "")
        {
            attributeValue = "NON-MONSTER";
        }
        if(attributeCounts[attributeValue] === undefined)
        {
            attributeCounts[attributeValue] = 0;
        }
        attributeCounts[attributeValue] = attributeCounts[attributeValue] + 1; 
    });
    attributeCounts = sortValues(attributeCounts);


    let typeCounts = [];
    cardData.forEach((card) => {
        let typeValue = card.race;
        if(typeValue === "" || !(card.type.toLowerCase().includes("monster")))
        {
            typeValue = "NON-MONSTER";
        }
        if(typeCounts[typeValue] === undefined)
        {
            typeCounts[typeValue] = 0;
        }
        typeCounts[typeValue] = typeCounts[typeValue] + 1;
    });

    delete typeCounts["NON-MONSTER"];
    typeCounts = sortValues(typeCounts);
    //end of bar chart stuff

    
    let archetypeCounts = {};
    cardData.forEach((card) => {
        let archetypeValue = card.archetype;
        if(card.archetype === "")
        {
            archetypeValue = "none";
        }
        if(archetypeCounts[archetypeValue] === undefined)
        {
            archetypeCounts[archetypeValue] = 0;
        }
        archetypeCounts[archetypeValue] = archetypeCounts[archetypeValue] + 1; 
    });
    delete archetypeCounts["none"];
    archetypeCounts = sortValues(archetypeCounts);

    let avgArcCount = 0;
    let arcCountlength = 0;
    Object.values(archetypeCounts).forEach(function(card){
        avgArcCount = avgArcCount + parseFloat(card);
        arcCountlength = arcCountlength + 1;
    })
    avgArcCount = avgArcCount * 1.0/arcCountlength;
    //barcode stuff
    const axisTextAlignmentFactor = 3;
    const archetypeExtent = extent(Object.values(archetypeCounts), (d) => {
        return d;
    });

    const yScale = scaleLinear()
        .domain(archetypeExtent)
        .range ([chartSize - margin, chartSize - 350]);

    archetypeCountsWithAverage = {...archetypeCounts};
    archetypeCountsWithAverage["average"] = avgArcCount;
    //end of barcode stuff
    return (
        
        <div>
            <h1>Exploratory Data Analysis, Assignment 2, info 474 sp 2021</h1>
            <p>{cardLoading && "Loading card data!"}</p>

            <h3>Background</h3>
            <p>The following visualizations use the dataset of all existing cards in the Yu-Gi-Oh! trading card game. The captions for these visualizations
                make heavy references to the properties of Yu-Gi-Oh cards, specifically monster cards (which represent the creatures each player uses, like
                creature cards in Magic the Gathering). The following image from the rulebook explains what these properties are and where to find them on a 
                card:
            </p>

            <img src="https://raw.githubusercontent.com/ramirostUW/info474assignment2/main/rulebook_image.PNG" alt="image from rulebook" length="500" width = "800" /> 

            <p>For further elaboration, it's worth noting a few additional points:</p>
            <ul>
                <li>Some, but not all, cards belong to certain groups called archetypes. An archetype is a group of cards that all have a 
                specific word or phrase in their name, with some support cards specifically working only with cards whose name contains 
                that word or phrase. Consider for example, the Blue-Eyes White Dragon, an iconic monster from the series; because that 
                card's name contains the phrase "Blue-Eyes", it is considered part of the Blue-Eyes archetype and is compatible with 
                support cards like the <a href="https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=12294">
                White Stone of Ancients</a>. For the sake of simplicity, support cards for archetype groups are also considered part of the group. <br /></li>
                <li>The level of a Monster Card, which the above graphic notes is specified by the amount of stars under a card's name, generally corresponds 
                    to how easy a card is to bring into play. Monster cards with a level of 4 or lower can usually be summoned most easily, and can
                    be placed into play at no cost. Monster cards with levels 5 and 6 require one tribute, or the sacrificing of a monster already in play.
                    Monster cards of level 7 or higher require 2 tributes. There are other ways to summon several of these monsters, whether it be
                    through effects of their own or those of other cards, but it is generally considered that cards of a higher level are harder to place 
                    into play. Although there is a lot of nuance to this assumption, these visualizations generally hold it to be true for the sake of simplicity.
                </li>
                <li>The above graphic lists 6 attributes. This is an incomplete list; there are actually 7 (the graphic does not mention the DIVINE attribute,
                    which only belongs to a very small group of cards but is not otherwise special in any way relevant to these visualizations).</li>
            </ul>


            <h3>Write-up: Introduction and initial thought process</h3>
            <p>The questions that I thought of investigating during EDA are: </p>
            <ul>
            <li>What cards can be considered above-average offensively and what secondary qualities do they have? </li>
            <li>Which attributes and types are the most common and what does it mean to belong to those groups? </li>
            <li>What does the distribution of archetypes' sizes look like, and does it indicate any favoritism towards some of them?</li>
            </ul>
            <p>With these questions in mind, I used several of the visualizations that we went over in lecture to try to gather answers to these questions.
               I used scatterplots to try to see if I could find any relationship between monsters' ATK values and some of their other numeric quantities. I 
               then used a histogram to try to gain some insight on the distribution of those ATK values amd see if any abnormal distributions would throw
               a wrench in the conclusions I could draw from the scatterplots. I then used bar charts to identify the largest type and attribute groups (although
               we were not explicitly taught these, they are similar enough to histograms that I could adapt the code). Finally, I used a barcode plot to look
               at the sizes for all archetypes in the game.
               The second half of the write-up, the conclusions, will be included in the bottom of the page.
            </p>
            {!cardLoading && <div>
            
            <h3>Scatterplot: Attack on X-axis, Level on Y-axis</h3>
            <svg
            width={chartSize}
            height={chartSize} 
            style={{border: "1px solid black"}}>
                {monsterData.map((card, index) => { 
                    const highlight = (avgAtk-100) <= card.atk && card.atk <= (avgAtk+100);
                    return <circle 
                    key={index} 
                    cx={margin + (card.atk*.09)} 
                    cy={chartSize - margin - card.level*15} 
                    r="3"
                    fill="none"
                    stroke={highlight ?  "red" : "steelblue"}
                    strokeOpacity="0.2"/>
                })}
            </svg>

            <p>This scatterplot portrays the ATK values of all yugioh cards, which define their basic offensive
                capability, on the x-axis, and the level of those monsters on the y-axis. The red highlighted 
                circles represent cards whose ATK values are roughly equal to the average ({avgAtk} ATK points) across all Monster 
                cards in the game (with a +/- margin of 100 points).  Given that the area to the center-right of the highlight 
                appears to be the most opaque, this shows that these monsters are probably the most successful due to their mix of ATK 
                capability and ease of access. This would create a lot of demand for such cards, which would explain why that area is dense 
                (because Konami keeps up with that demand). This scatterplot also seems to be fairly diagonal, except for a straight  vertical 
                line along the left, which indicates there is a loose correlation between ATK value and level (which makes sense, since higher-
                leveled cards tend to be harder to access, which means that cards with more ATK points will generally be harder to access). </p>

            <h3>Scatterplot: Attack on X-axis, Defense on Y-axis</h3>
            <svg
            width={chartSize}
            height={chartSize} 
            style={{border: "1px solid black"}}>
                {monsterData.map((card, index) => {   
                    //const highlight = card.def < 1;
                    const highlight = (avgAtk-100) <= card.atk && card.atk <= (avgAtk+100);//card.atk > 4999 || card.atk < 1;   
                    return <circle 
                    key={index} 
                    cx={margin + (card.atk*.09)} 
                cy={chartSize - margin - card.def*.09} 
                    r="3"
                    fill="none"
                    stroke={highlight ?  "red" : "steelblue"}
                    strokeOpacity="0.2"/>
                })}
            </svg>
            <p>This scatterplot shows the card pool's ATK points in the x-axis and its DEF points on the y-axis. I had speculated that cards with 
                more ATK points would most likely also have more DEF points, but despite the somewhat more opaque circles down the diagonal, 
                there does not seem to be a strong relationship between ATK and DEF, given that cards with each amount of ATK points seem to also
                correspond to many cards along the entire range of the y-axis.
            </p>
            
            <h3> Histogram of Card ATK Values</h3>
            <svg width={chartSize} height={chartSize} style={{ border: "1px solid black" }}>
                {cardBins.map((bin, index) => {
                    let highlight =  false; //(avgAtk-100) <= card.atk && card.atk <= (avgAtk+100);
                    bin.forEach(function(card){
                        if((avgAtk-100) <= card && card <= (avgAtk+100))
                            highlight = true;
                    })
                    const binheight = bin.length /10;
                    return (
                        <rect 
                        y={chartSize - margin - (binheight*5)} 
                        width="15" 
                        height={binheight * 5} 
                        x={histogramLeftPadding + index * 16 }
                        fill={highlight ?  "red" : "steelblue"}/>
                        //<rect key={index} x={index * 11} y={chartSize} width="10" height={bin.length}/>
                    );
                })}
            </svg>
            <p> This histogram shows the distribution of ATK values across the card pool. I did not know what to expect the distribution
                to look like, but the results are still interesting and useful to look at. It appears that the distribution of ATK values 
                mostly resembles a normal distribution, a little bit skewed to the left, with most cards probably landing somewhere around
                that average ATK value.
            </p>

            <h3> Histogram of Card ATK Values Part II</h3>
            <svg width={chartSize} height={chartSize} style={{ border: "1px solid black" }}>
                {cardBins.map((bin, index) => {
                    let highlight =  index === 0; //(avgAtk-100) <= card.atk && card.atk <= (avgAtk+100);
                    const binheight = bin.length /10;
                    return (
                        <rect 
                        y={chartSize - margin - (binheight*5)} 
                        width="15" 
                        height={binheight * 5} 
                        x={histogramLeftPadding + index * 16 }
                        fill={highlight ?  "red" : "steelblue"}/>
                        //<rect key={index} x={index * 11} y={chartSize} width="10" height={bin.length}/>
                    );
                })}
            </svg>
            <p> Elaborating on the first histogram caption, the one clear exception to this is 
                the large bin on the far left of the graph, which represent the cards with the absolute
                lowest attack values. This is an interesting anomaly, but does not seem to be incorrect or represent an incorrect result. The 
                reason why is that Monster Cards in Yu-Gi-Oh! do not just provide value through their statlines; a lot of them also carry powerful
                effects, and those that have very powerful ones, even ones that are meant to be used offensively, often carry 0 base ATK as a trade-off.
                One prominent example is <a href="https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=7342">Armityle the Chaos Phantasm</a>,
                which has a natural amount of 0 ATK but whose effect provides it with a permanent boost of 10,000 ATK points (this is done through an effect
                most likely to provide Armityle with a weakness to effect negation cards, in order to balance it when attacking). Thus, 0 ATK is often used to 
                make a statement that says "the sole purpose of this card is for it to use its effect". Thus, it makes sense that the leftmost bin would be the
                largest. 
            </p>

            <h3>Attribute Bar chart </h3>
            <svg width={chartSize} height = {chartSize} style={{border: "1px solid black"/*, margin-left: "100"*/}}>
                {
                   Object.keys(attributeCounts).map((datumKey, index) => {
                            let datum = attributeCounts[datumKey];
                            let highlight = datumKey === "EARTH";
                            return (
                                <rect key={index} x={margin + index*55} y={chartSize - datum/10} width="50" height={datum/10} fill={highlight ?  "red" : "steelblue"}/>
                                
                                
                            )
                    })
                }
                {
                    Object.keys(attributeCounts).map((datumKey, index) => {
                        let datum = attributeCounts[datumKey];
                        return (
                            <text key={index + "text"} x={margin + index*55} y={chartSize - (datum/10) - 3}>{datum}</text>
                        )
                    })
                }
                {
                    Object.keys(attributeCounts).map((datumKey, index) => {
                        let datum = attributeCounts[datumKey];
                        return (
                            <text key={index + "text"} x={margin + index*55} y={chartSize - (datum/10) - 20}>{datumKey}</text>
                        )
                    })
                }
            </svg>
            <p>This bar chart shows the amount of monsters that belong to each of the seven monster attributes (plus an additional column to
                represent cards that are not monsters). The most surprising part for me was that EARTH was the second-largest attribute group, 
                after DARK. This surprised me because I expected LIGHT and DARK to be the top two, because they are usually seen as the most iconic
                (all the protagonists's ace monsters in the Yu-Gi-Oh! cartoons had a LIGHT or DARk ace monster, except for the third one, who had a 
                WIND one), and as the most competitively viable, with a lot of strong support for both mono-LIGHT and mono-DARK decks, and also for 
                dual-LIGHT {"&"} DARK decks. EARTH, meanwhile, is usually not seen as neither popular nor competitively strong. Despite all of this, 
                it still took the second place spot.    
            </p>

            <h3>Type Bar chart </h3>
            <svg width={chartSize * 2} height = {chartSize} style={{border: "1px solid black"/*, margin-left: "100"*/}}>
                {
                   Object.keys(typeCounts).map((datumKey, index) => {
                        let highlight = datumKey === "Dragon";
                        let datum = typeCounts[datumKey];
                        return (  
                            <rect key={index} x={margin + index*38} y={chartSize - datum/2} width="33" height={datum/2} fill={highlight ?  "red" : "steelblue"}/>
                                
                        )
                    })
                }
                {
                    Object.keys(typeCounts).map((datumKey, index) => {
                        let datum = typeCounts[datumKey];
                        return (
                            <text key={index + "text"} x={margin + index*38} y={chartSize - (datum/2) - 3} fontSize="8">{datum}</text>
                        )
                    })
                }
                {
                    Object.keys(typeCounts).map((datumKey, index) => {
                        let datum = typeCounts[datumKey];
                        return (
                            <text key={index + "text"} x={margin + index*38} y={chartSize - (datum/2) - 10} fontSize = "7">{datumKey}</text>
                        )
                    })
                }
            </svg>
            <p>This bar chart shows the amount of monsters that correspond to each type in the game. I was highly surprised by the
                results the graph showed, because I expected the Dragon type to be the most represented type. This is due to several reasons:
                dragons are consistently ranked as the most popular type in community polls, have more iconic protagonist monsters than any other
                type, similar to the aforementioned LIGHT and DARK attributes, and are a consistently strong mono-type deck in competitive 
                tournaments, much more than any other type. Despite this, they were only fifth-largest type group.  
            </p>

            <h3>Spread of Archetype Sizes</h3>
            <svg
             width={chartSize}
            height={chartSize} 
            style={{border: "1px solid black"}}>  <text 
                x={chartSize/2 - 12}
                y={yScale(0 ) + axisTextAlignmentFactor} 
                textAnchor="end"
                style={{ fontSize: 10, fontFamily: "Gill Sans, sans serif" }}>
                    0
                </text>

                <text 
                x={chartSize/2 - 12} 
                y={yScale(100) + axisTextAlignmentFactor/*chartSize - margin - 100 + axisTextAlignmentFactor*/}
                textAnchor="end"
                style={{ fontSize: 10, fontFamily: "Gill Sans, sans serif" }}>
                    100
                </text>

                <text 
                x={chartSize/2 - 12} 
                y={yScale(50) + axisTextAlignmentFactor/*chartSize - margin - 100 + axisTextAlignmentFactor*/}
                textAnchor="end"
                style={{ fontSize: 10, fontFamily: "Gill Sans, sans serif" }}>
                    50
                </text>


                <line
                    x1={chartSize/2 - 10}
                    y1={yScale(100)}
                    x2={chartSize/2 - 5}
                    y2={yScale(100)}
                    stroke={"black"}
                />

                <line
                    x1={chartSize/2 - 10}
                    y1={yScale(0)}
                    x2={chartSize/2 - 5}
                    y2={yScale(0)}
                    stroke={"black"}
                />

                <line
                    x1={chartSize/2 - 10}
                    y1={yScale(50)}
                    x2={chartSize/2 - 5}
                    y2={yScale(50)}
                    stroke={"black"}
                />

                {Object.values(archetypeCountsWithAverage).map((measurement, index) => {   
                    const highlight = measurement === avgArcCount;
                    return <line 
                    key={index} 
                    x1={chartSize/2}
                    y1={yScale(measurement)}
                    x2={chartSize/2 + 20}
                    y2={yScale(measurement)}
                    stroke={highlight ? "red" : "steelblue"}
                    strokeOpacity={highlight ? 1 : 0.2}
                    />
                })}
            </svg>
            <p>This barcode plot shows all of the different archetypes in the game. In looking at the spread of these sizes, 
                I expected the bar code plot with D3 scales to look similar to the TMAX plot we made in lecture, with a fairly uniform \
                distribution that sputtered somewhat uniformly towards the top and bottom. This was clearly not the case. 
                The red highlight towards the middle-bottom of this barcode shows the average amount of cards across all of the game's archetypes.
                It's proximity with the bottom, and by extension distance from the top, of the barcode plot shows that the spread of archetype sizes is very uneven.
            </p>

            <h3>Spread of Archetype Sizes Part II</h3>
            <svg
             width={chartSize}
            height={chartSize} 
            style={{border: "1px solid black"}}>  <text 
                x={chartSize/2 - 12}
                y={yScale(0 ) + axisTextAlignmentFactor} 
                textAnchor="end"
                style={{ fontSize: 10, fontFamily: "Gill Sans, sans serif" }}>
                    0
                </text>

                <text 
                x={chartSize/2 - 12} 
                y={yScale(100) + axisTextAlignmentFactor/*chartSize - margin - 100 + axisTextAlignmentFactor*/}
                textAnchor="end"
                style={{ fontSize: 10, fontFamily: "Gill Sans, sans serif" }}>
                    100
                </text>

                <text 
                x={chartSize/2 - 12} 
                y={yScale(50) + axisTextAlignmentFactor/*chartSize - margin - 100 + axisTextAlignmentFactor*/}
                textAnchor="end"
                style={{ fontSize: 10, fontFamily: "Gill Sans, sans serif" }}>
                    50
                </text>


                <line
                    x1={chartSize/2 - 10}
                    y1={yScale(100)}
                    x2={chartSize/2 - 5}
                    y2={yScale(100)}
                    stroke={"black"}
                />

                <line
                    x1={chartSize/2 - 10}
                    y1={yScale(0)}
                    x2={chartSize/2 - 5}
                    y2={yScale(0)}
                    stroke={"black"}
                />

                <line
                    x1={chartSize/2 - 10}
                    y1={yScale(50)}
                    x2={chartSize/2 - 5}
                    y2={yScale(50)}
                    stroke={"black"}
                />

                {Object.values(archetypeCounts).map((measurement, index) => {   
                    const highlight = measurement === 128;
                    return <line 
                    key={index} 
                    x1={chartSize/2}
                    y1={yScale(measurement)}
                    x2={chartSize/2 + 20}
                    y2={yScale(measurement)}
                    stroke={highlight ? "red" : "steelblue"}
                    strokeOpacity={highlight ? 1 : 0.2}
                    />
                })}
            </svg>
            <p> The other interesting feature of the bar code plot I saw an extreme outlier towards the top. That top archetype was significantly above the 100-card mark, which at first seemed 
                too much like a mistake or data anomaly because the next-biggest archetype was around halfway between the 100 and 50 card marks. However, 
                examination of the dataset proved that it was not an anomaly, and that the top tick represented the Elemental Hero archetype, one of the most
                iconic group of cards in the game (the archetype filled almost the entire deck of the protagonist of the second cartoon series, and represented the 
                first use of archetype-support cards by a main character in the cartoon). Due to this first-past-the-post status, it appears that this 
                group of cards was rewarded with significant amounts of members and support cards.
            </p>

            <h3>Write-up: Conclusions</h3>
            While making all of these visualizations, I had several assumptions for each of the subsets of cards that I explored. Generally, a lot of these
            assumptions can be summarizes as "I expect more offensively-capable cards to generally also have other strong qualities, but in term be more 'expensive'
            in terms of the cost of putting them in play" "I expect larger groups of cards to be more iconic and/or competitively strong", and I wanted to see whether
            this basic exploration here would support them. The answer to that question can in turn be summarized as "Sometimes, but not all the time".
            <br />
            <br />
            The distributions of ATK values among Monster Cards were the most-explored aspect of this dataset. The distribution of ATK values did resemble a normal
            distribution fairly closely outside of the unexpected-but-reasonable dominance of cards with few-to-none ATK points, and did generally seem to be more
            expensive to place into play as their attack increased, as seen by the diagonal-looking plot between ATK and level. However, the relationship between
            ATK and other strong qualities, in this case DEF points, did not materialize as strongly. 
            <br />
            <br />
            Meanwhile, the idea that larger groups would represent a more iconic and/or competitively viable subset of cards also failed to materialize. This was shown 
            both by the prominence of EARTH-attribute cards in the dataset, which shows that non-iconic and non-compeititvely viable subsets could still be relatively large,
            and the lack of prominence of Dragon-type cards showed the inverse (that iconic and competitively-viable subsets could still be small).
            <br />
            <br />
            Finally, I included the barcode plot showing the spread of archetype sizes with the unique goal of seeing Konami whether Konami was "playing favorites" or not; essencially,
            I expected the bar code plot to show a fairly uniform spread, with maybe some archetypes having more than others due to possibly being older and thus
            having more time to accumulate support, and some smaller archetypes that were relatively new and maybe didn't debut with as many cards as others, 
            but overall I thought there would not be a significantly assymetrical spread or notable outliers. Here, I was clearly wrong as well; the 
            spread of archetype sizes clearly had many more small archetypes than large ones, with the largest outlier being so much higher than the other ones that
            it was hard to spot. The fact that there are very clearly a handful of very large archetypes in a field of mostly smaller ones, and that the notable
            archetype was arguably the most well-known one, showed that the spread of archetype sizes is largely unequal and there some significant amount of 
            favoritism.

            </div>}

        </div>
    )
}

export default App;