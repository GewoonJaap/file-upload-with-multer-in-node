const form = document.getElementById("new_document_attachment");
const fileInput = document.getElementById("document_attachment_doc");
const dropArea = document.getElementById("dropArea");

dropArea.addEventListener("dragover", (event) => {
    event.preventDefault(); //preventing from default behaviour
});


dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    fileInput.files = event.dataTransfer.files;
    form.submit();
});

fileInput.addEventListener('change', () => {
    form.submit();
});

window.addEventListener('paste', e => {
    fileInput.files = e.clipboardData.files;
});