const data_querry = "dados";
const containsValidWord = /[\p{L}\s]*[\p{L}]{2,}[\p{L}\s]*/u;
const fullUrlWithQuery = window.location.origin + "/" + window.location.search;
const urlParams = new URLSearchParams(window.location.search);
const arrayString = urlParams.get(data_querry);
const url = `${window.location.origin}/?${data_querry}=${arrayString}`;
const text_array_lines = arrayString.split(',');
text_array_lines.pop();

// text_array
const text_array = [];
text_array_lines.forEach(element => text_array.push(element.split(';')));
text_array.forEach(element => {
    for (let i = 3; i <= element.length; i += 3) {
        if (!containsValidWord.test(element[i])) {
            for (let j = 0; j <= 2; j++) {
                element[i-j] = "";
            }
        }
    }
});

// data_array
const data_array = []; 
text_array.forEach(element => {
    const temp_array = element.filter(element => element !== "");
    (temp_array.length > 1) ? data_array.push(temp_array) : "";
});

console.log(data_array);

// data_list
const data_text = [];
data_array.forEach(element => {
    for (let i = 3; i < element.length; i += 3) {
        data_text.push(element[i]);
    }
});

console.log(data_text);

getData();

async function getData() {

    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data_text)
    }
    const resposta = await fetch('https://autocad-translator-server.vercel.app/api', options);
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