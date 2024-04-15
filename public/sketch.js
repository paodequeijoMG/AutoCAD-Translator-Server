const data_querry = "dados";
const fullUrlWithQuery = window.location.origin + "/" + window.location.search;
const urlParams = new URLSearchParams(window.location.search);
const arrayString = urlParams.get(data_querry);
// console.log(arrayString);

// preparação da string para tradução
let data_array = arrayString.split('§');
data_array.pop();
// console.log(JSON.parse(JSON.stringify(data_array)));
for (let i = 1; i < data_array.length; i+= 2) {
    data_array[i] = data_array[i].split(";")
}
// console.log(data_array);

// text_array
const deepCopy = (arr) => {
    return arr.map(item => Array.isArray(item) ? deepCopy(item) : item);
};
const data_text = [];
for (let i = 0; i < data_array.length; i = i + 2) {
    data_text[i/2] = {
        id: data_array[i],
        text_array: deepCopy(data_array[i+1])
    }
}
// console.log(JSON.parse(JSON.stringify(data_text)));

// ----REGEX----
// PALAVRAS QUE COMEÇAM COM "\" "." "{"
let regex = /^[\\.\\{]/;
for (let j = 0; j < data_text.length; j++) {
    let range = data_text[j].text_array.length - 1;
    for (let i = range; i >= 0; i--) {
        let match = regex.test(data_text[j].text_array[i]);
        (match) ? data_text[j].text_array.splice(i, 1) : "";
    }
}
// console.log(JSON.parse(JSON.stringify(data_text)));

//Redução da string tirando ("/" + texto subsequente)
regex = /\\(?!U)/;
for (let j = 0; j < data_text.length; j++) {
    let range = data_text[j].text_array.length - 1;
    for (let i = range; i >= 0; i--) {
        let str = data_text[j].text_array[i];
        let match = str.search(regex);
        (match !== -1) ? data_text[j].text_array[i] = data_text[j].text_array[i].slice(0, match) : "";
    }
}
// console.log(JSON.parse(JSON.stringify(data_text)));

// PALAVRAS VALIDAS PARA TRADUÇÃO
regex = /[\p{L}\s]*[\p{L}]{2,}[\p{L}\s]*/u;
for (let j = 0; j < data_text.length; j++) {
    let range = data_text[j].text_array.length - 1;
    for (let i = range; i >= 0; i--) {
        let match = regex.test(data_text[j].text_array[i]);
        (!match) ? data_text[j].text_array.splice(i, 1) : null;
    }
}

// FILTRAR ARRAYS SEM TEXTO
for (let i = data_text.length - 1; i >= 0; i--) {
    (data_text[i].text_array.length === 0) ? data_text.splice(i, 1) : null;
}
// console.log(JSON.parse(JSON.stringify(data_text)));


const api_array = [];
for (let i = 0; i < data_text.length; i++) {
    let sub_array = [];
    for (let j = 0; j < data_text[i].text_array.length; j++) {
        sub_array.push(data_text[i].text_array[j]);
    }
    api_array.push(sub_array);
}
const api_flatten = api_array.flat();
// console.log(api_flatten);

getData(api_flatten, data_text, data_array);


async function getData(dado, array_sub, array_complete) {

    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dado)
    }
    const resposta = await fetch("/api", options);
    const json = await resposta.json()

    //CRIAÇÃO DE UMA ARRAY DA MESMA ESTRUTURA DA QUAL FOI CRIADA NA ROTINA LISP
    const response_text_array = [];
    let accumulator = 0;
<<<<<<< HEAD
    // console.log({json: json, array_sub: array_sub, array_complete: array_complete});

    for (let i = 0; i < array_sub.length; i++) {
        response_text_array.push(array_sub[i].id);
        let temp_string = array_complete[(i*2)+1].join(";");
=======
    console.log({json: json, array_sub: array_sub, array_complete: array_complete});

    for (let i = 0; i < array_sub.length; i++) {
        response_text_array.push(array_sub[i].id);
        let temp_string = array_complete[(i*2)+1];
>>>>>>> daa1b7b55fac292d7154bbadcec7351f930a6df8
        for (let j = 0; j < array_sub[i].text_array.length; j++) {
            if (json.texto[accumulator].text !== array_sub[i].text_array[j]) {
                temp_string = temp_string.replace(array_sub[i].text_array[j] ,json.texto[accumulator].text)
            }
            accumulator++;
        }
        response_text_array.push(temp_string);
    }
<<<<<<< HEAD
    // console.log({response_text_array: response_text_array});

    //String de resposta com texto traduzido
    const lsp_string = response_text_array.join("§").concat("§");
    // console.log(lsp_string);
    closeBrowser(lsp_string);
}

function closeBrowser(lsp_string) {
    Acad.Editor.executeCommand(`(setq api_string_response "")`);
    let str_size = 200;
    let i = 0;
    for (i = 0; i < lsp_string.length; i += str_size) {
        Acad.Editor.executeCommand(`(setq api_string_response (strcat api_string_response "${lsp_string.slice(i, i + str_size)}"))`);
    }
    Acad.Editor.executeCommand("txtcp");
}
=======
    console.log({response_text_array: response_text_array});

    //String de resposta com texto traduzido
    let lsp_string = response_text_array.join("???").concat("???");
    lsp_string = lsp_string.replaceAll(",", "<v>");
    lsp_string = lsp_string.replaceAll("???", ",");
    lsp_string = lsp_string.replaceAll("<v><v>", "<v>");
    let lsp_strings_array = [];
    let str_end;
    const string_chunks_size = 200;
    for (let i = 0; i < lsp_string.length; i = i + string_chunks_size) {
        (i + string_chunks_size < lsp_string.length) ? (str_end = i + string_chunks_size) : (str_end = lsp_string.length);
        let sub_string = lsp_string.substring(i, str_end);
        lsp_strings_array.push(sub_string);
    }
<<<<<<< HEAD
    console.log(lsp_string);
    console.log(lsp_strings_array);
    closeBrowser(lsp_strings_array);
}

function closeBrowser(lsp_string) {
    lsp_string.forEach(element => Acad.Editor.executeCommand(`(setq api_string_response (strcat api_string_response "${element}"))`));
    Acad.Editor.executeCommand(`(setvar "USERI1" 1)`);
    Acad.Editor.executeCommand("trdztxt");
}


=======

    // let translated_text = data_array[0] + "," + data_array[1];
    let translated_text = "";

    for (let i = 2; i < data_array.length; i = i + 2) {       
        translated_text = translated_text + ", " + data_array[i] + ", " + data_array[i+1]
    }
    
    console.log({array: data_array, texto_traduzido: translated_text});


    const text_send = `._princ (setq listinha ${translated_text})`
    // Acad.Editor.executeCommand("._REGENALL");
    Acad.Editor.executeCommand(`_princ (setq a "ola")`);
    alert("foi");
}

function closeBrowser() {
 
    // Acad.Editor.executeCommand("._trdztxt");
}

>>>>>>> e3c265e79177bc2ee3b95f532ce014854fc8b9d6
>>>>>>> daa1b7b55fac292d7154bbadcec7351f930a6df8
