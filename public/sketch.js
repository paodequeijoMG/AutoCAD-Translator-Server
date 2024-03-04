const data_querry = "dados";
const fullUrlWithQuery = window.location.origin + "/" + window.location.search;
const urlParams = new URLSearchParams(window.location.search);
const arrayString = urlParams.get(data_querry);
const url = `${window.location.origin}/?${data_querry}=${arrayString}`;
let data_array = arrayString.split(',');
data_array.pop();
data_array.forEach(element => {
    console.log("ola");
    if (element.length > 1) {
        let element_splited = element.split(";");
        element = element_splited;
    }
});
console.log(data_array);


// text_array
const data_text = [];
for (let i = 0; i < data_array.length; i = i + 2) {
    data_text[i/2] = {
        id: data_array[i],
        text_array: data_array[i+1]
    }
}
console.log(data_text);
data_text.forEach((element, index) => data_text[index].text_array = element.text_array.split(';'));
data_text.forEach(element => {
    let str_count = 0;
    for (let i = 0; i < element.text_array.length; i++) {
        element.text_array[i] = {
            index: str_count,
            text: element.text_array[i]
        }
        str_count = str_count + element.text_array[i].text.length;
    }
});
console.log(JSON.parse(JSON.stringify(data_text)));

// ----REGEX----
// PALAVRAS QUE COMEÇAM COM "\" "." "{"
let regex = /^[\\.\\{]/;
for (let j = 0; j < data_text.length; j++) {
    let range = data_text[j].text_array.length - 1;
    for (let i = range; i >= 0; i--) {
        let match = regex.test(data_text[j].text_array[i].text);
        (match) ? data_text[j].text_array.splice(i, 1) : "";
    }
}
console.log(JSON.parse(JSON.stringify(data_text)));

//Palavras sem "/"+texto subsequente
regex = /\\(?!U)/;
for (let j = 0; j < data_text.length; j++) {
    let range = data_text[j].text_array.length - 1;
    for (let i = range; i >= 0; i--) {
        let str = data_text[j].text_array[i].text;
        let match = str.search(regex);
        (match !== -1) ? data_text[j].text_array[i].text = data_text[j].text_array[i].text.slice(0, match) : "";
    }
}
console.log(JSON.parse(JSON.stringify(data_text)));

// PALAVRAS VALIDAS PARA TRADUÇÃO
regex = /[\p{L}\s]*[\p{L}]{2,}[\p{L}\s]*/u;
for (let j = 0; j < data_text.length; j++) {
    let range = data_text[j].text_array.length - 1;
    for (let i = range; i >= 0; i--) {
        let match = regex.test(data_text[j].text_array[i].text);
        (!match) ? data_text[j].text_array.splice(i, 1) : null;
    }
}
// FILTRAR ARRAYS SEM TEXTO
for (let i = data_text.length - 1; i > 0; i--) {
    (data_text[i].text_array.length === 0) ? data_text.splice(i, 1) : null;
}
console.log(data_text);

const api_array = [];
for (let i = 0; i < data_text.length; i++) {
    let sub_array = [];
    for (let j = 0; j < data_text[i].text_array.length; j++) {
        sub_array.push(data_text[i].text_array[j].text);
    }
    api_array.push(sub_array);
}
console.log(api_array);

getData();

async function getData() {

    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(api_array)
    }
    // const url_lh = new URL("https://autocad-translator-server.vercel.app/");
    const resposta = await fetch("/api", options);
    const json = await resposta.json();
    console.log(json);

    const text_translated_array = [];
    for (let i = 0; i < json.texto.length; i++) {
        text_translated_array.push(json.texto[i].text)
    }

    const data_array_translated = data_array.map(innerArray => [...innerArray]);;
    let index = 0;
    for (let i = 0; i < data_array.length; i++) {
        for (let j = 3; j < data_array[i].length; j += 3) {
            data_array_translated[i][j] = text_translated_array[index];
            index++;
        }
    }
    const lines = data_array_translated.map(innerArray => innerArray.join(';'));
    const outputText = decodeHtmlEntities(lines.join(';\n') + ";");

    // Create a Blob with the JSON data
    const downloadLink = document.getElementById("dl_txt");
    const text_blob = new Blob([outputText], { type: 'text/plain' });
    
    // Set the download link attributes
    downloadLink.href = window.URL.createObjectURL(text_blob);
    downloadLink.download = 'api_response.txt';
    downloadLink.style.display = 'none';

    // Add an event listener to execute callback function when download is complete
    downloadLink.addEventListener('click', function() {
        // Ensure that the download is completed before calling callback
        if (downloadLink.href.startsWith('blob:')) {
            // Execute the callback function after a short delay (adjust the delay as needed)
            setTimeout(function() {
                // Assuming that Acad is globally accessible (replace with the actual global object)
                if (Acad && Acad.Editor) {
                    closeBrowser(downloadLink.href, url);
                } else {
                    console.error('Acad or Acad.Editor is not accessible. Unable to execute callback.');
                }
            }, 1000);
        }
    });

    // Trigger a click on the link to initiate the download
    downloadLink.click();
}

function closeBrowser(reference, _url) {
    window.URL.revokeObjectURL(reference);
    Acad.Editor.executeCommand("regen");
    Acad.Editor.executeCommand("._trdztxt");
}

function decodeHtmlEntities(html) {
    var txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}