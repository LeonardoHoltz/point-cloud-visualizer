import * as d3 from "d3-scale-chromatic";
import configData from '../config/conf.json' assert { type: 'json' };

export function buildLegend() {
    const classColors = {};
    configData.classes.forEach((item, i) => {
        classColors[item] = d3.schemeCategory10[i % 10];
    });
    console.log("Legend colors:", classColors);
    console.log(d3.schemeCategory10);
    const legend = document.getElementById("legend");
    legend.innerHTML = "";

    for (const [label, color] of Object.entries(classColors)) {
        const item = document.createElement("div");
        item.className = "legend-item";

        const colorBox = document.createElement("div");
        colorBox.className = "legend-color";
        colorBox.style.background = color;

        const text = document.createElement("span");
        text.innerText = label;

        item.appendChild(colorBox);
        item.appendChild(text);
        legend.appendChild(item);
    }
}