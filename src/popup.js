document.getElementById("get").onclick = () => {
    const archiveName = document.getElementById("archiveName").value;
    if (archiveName === null || archiveName === "") {
        console.log(archiveName)
        document.getElementById("result").innerHTML = "Saída: Para prosseguir, é necessário inserir o nome do arquivo."
        return;
    }

    chrome.runtime.sendMessage({ action: "get_snapshot" }, (snapshot) => {

        if (!snapshot || !snapshot.strings) {
            document.getElementById("result").innerHTML = "Saída: snapshot inválida!";
            return;
        }

        const strings = snapshot.strings;

        const index = strings.findIndex(s =>
            typeof s === "string" &&
            s.toUpperCase().includes("MOSAIC-BOOK")
        );

        if (index === -1) {
            document.getElementById("result").innerHTML = "Tag principal não encontrada!"
            return;
        }

        const result = strings.slice(index + 1);
        const processed = [];
        let canPut = false;
        result.forEach(line => {
            if (typeof line !== "string") return;

            let text = line.trim();
            if (!text) return;
            if (text.startsWith("_")) return;
            if (text.toLowerCase().includes("massa_texto")) return;
            if (text === "body") {
                canPut = true;
                return;
            }

            if (!canPut) return;
            if (containsHTMLTAG(text)) return;

            processed.push(text);
        });

        const finalText = processed.join("\n======\n");

        const blob = new Blob([finalText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const resultDownload = document.createElement("a");
        resultDownload.href = url;
        resultDownload.download = archiveName + ".txt";
        resultDownload.click();
        URL.revokeObjectURL(url);
    });
};

function containsHTMLTAG(text) {
    return text === "a" ||
        text === "ul" || text === "li" ||
        text === "div" || text === "::marker" ||
        text === "•" || text.toLowerCase().startsWith("vst") ||
        text === "p" || text === "span" ||
        text.toLowerCase().startsWith("xml") || text.toLowerCase().startsWith("x01") ||
        text.toLowerCase().startsWith("bullet") || text === "marker"
}

