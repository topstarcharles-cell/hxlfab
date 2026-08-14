(() => {
  const form = document.querySelector("#rfqForm");
  if (!form) return;

  let currentStep = 1;
  let productType = "Standard rigid PCB";
  let selectedFiles = [];
  const maxFileBytes = 100 * 1024 * 1024;
  const maxTotalBytes = 200 * 1024 * 1024;
  const maxFiles = 10;
  const allowed = /\.(zip|7z|rar|tgz|gz|tar|gbr|ger|pho|art|drl|xln|odb|brd|pcb|fab|txt|pdf)$/i;

  const byName = (name) => form.elements.namedItem(name);
  const value = (name) => byName(name)?.value?.trim() || "";
  const setText = (id, text) => {
    const element = document.querySelector(`#${id}`);
    if (element) element.textContent = text;
  };

  function showStep(step) {
    currentStep = step;
    document.querySelectorAll("[data-step]").forEach((panel) => panel.classList.toggle("active", Number(panel.dataset.step) === step));
    document.querySelectorAll("[data-step-button]").forEach((button) => {
      const buttonStep = Number(button.dataset.stepButton);
      button.classList.toggle("active", buttonStep === step);
      button.classList.toggle("done", buttonStep < step);
      const marker = button.querySelector("span");
      if (marker) marker.textContent = buttonStep < step ? "✓" : `0${buttonStep}`;
    });
    document.querySelector("#quote")?.scrollIntoView({ behavior: "smooth", block: "start" });
    updateSummary();
  }

  function quoteData() {
    return {
      productType,
      width: value("width"),
      height: value("height"),
      quantity: value("quantity"),
      layers: value("layers"),
      material: value("material"),
      tg: value("tg"),
      thickness: value("thickness"),
      copper: value("copper"),
      minTrack: value("minTrack"),
      minHole: value("minHole"),
      finish: value("finish"),
      solderMask: value("solderMask"),
      silkscreen: value("silkscreen"),
      impedance: value("impedance"),
      viaProcess: value("viaProcess"),
      testing: value("testing"),
    };
  }

  function updateSummary() {
    const quote = quoteData();
    const width = Number(quote.width);
    const height = Number(quote.height);
    const quantity = Number(quote.quantity);
    const area = width > 0 && height > 0 && quantity > 0 ? (width * height * quantity) / 1_000_000 : 0;
    const reasons = [];
    if (productType !== "Standard rigid PCB") reasons.push(productType);
    if (Number.parseInt(quote.layers, 10) >= 12) reasons.push("12+ layer stack-up");
    if (["3 oz", "4+ oz"].includes(quote.copper)) reasons.push("heavy copper");
    if (["3/3 mil", "4/4 mil"].includes(quote.minTrack)) reasons.push("fine line / space");
    if (["0.10 mm laser", "0.15 mm mechanical"].includes(quote.minHole)) reasons.push("micro / small via");
    if (quote.impedance !== "No") reasons.push("controlled impedance");
    const orderClass = quantity > 1000 ? "Volume production" : quantity > 100 ? "Pilot batch" : "Prototype / NPI";
    const completeness = [quote.width, quote.height, quote.quantity, quote.layers, quote.material, quote.thickness, quote.copper, quote.minTrack, quote.minHole, quote.finish, value("name"), value("email"), value("company"), selectedFiles.length ? "files" : ""].filter(Boolean).length;

    setText("completion", `${Math.round((completeness / 14) * 100)}% complete`);
    setText("route", reasons.length ? "Advanced engineering review" : "Standard production review");
    setText("routeReason", reasons.length ? `Triggered by ${reasons.slice(0, 3).join(", ")}.` : "");
    setText("sumProduct", productType);
    setText("sumBoard", `${quote.width || "—"} × ${quote.height || "—"} mm · ${quote.layers} layers`);
    setText("sumOrder", `${quote.quantity || "—"} pcs · ${orderClass}`);
    setText("sumArea", area ? `${area.toFixed(2)} m²` : "—");
    setText("sumMaterial", `${quote.material} · ${quote.tg}`);
    setText("sumBuild", `${quote.thickness} · ${quote.copper}`);
    setText("sumFinish", quote.finish);
  }

  function showMessage(message, type = "") {
    const element = document.querySelector("#formMessage");
    element.textContent = message;
    element.className = `form-message ${type}`.trim();
  }

  function validateBasics() {
    const controls = [byName("width"), byName("height"), byName("quantity")];
    const invalid = controls.find((control) => !control.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      return false;
    }
    return true;
  }

  function addFiles(files) {
    showMessage("");
    const next = [...selectedFiles];
    for (const file of files) {
      if (next.length >= maxFiles) {
        showMessage(`A maximum of ${maxFiles} files is allowed.`, "error");
        break;
      }
      if (!allowed.test(file.name)) {
        showMessage(`${file.name} is not a supported PCB file or archive.`, "error");
        continue;
      }
      if (file.size <= 0 || file.size > maxFileBytes) {
        showMessage(`${file.name} exceeds the 100 MB per-file limit.`, "error");
        continue;
      }
      if (next.some((item) => item.name === file.name && item.size === file.size)) continue;
      if (next.reduce((sum, item) => sum + item.size, 0) + file.size > maxTotalBytes) {
        showMessage("The selected files exceed the 200 MB total limit.", "error");
        continue;
      }
      next.push(file);
    }
    selectedFiles = next;
    renderFiles();
    updateSummary();
  }

  function renderFiles() {
    const list = document.querySelector("#fileList");
    list.replaceChildren();
    selectedFiles.forEach((file, index) => {
      const item = document.createElement("li");
      const name = document.createElement("strong");
      name.textContent = file.name;
      const size = document.createElement("small");
      size.textContent = `${(file.size / 1_048_576).toFixed(2)} MB`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove ${file.name}`);
      remove.addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        renderFiles();
        updateSummary();
      });
      item.append(name, size, remove);
      list.append(item);
    });
  }

  function updateProgress(completedBytes, activeLoaded, totalBytes, label) {
    const percent = totalBytes ? Math.min(100, Math.round(((completedBytes + activeLoaded) / totalBytes) * 100)) : 0;
    document.querySelector("#uploadProgress").hidden = false;
    document.querySelector("#progressBar").value = percent;
    setText("progressPercent", `${percent}%`);
    setText("progressLabel", label);
  }

  function uploadFile({ id, uploadToken }, file, completedBytes, totalBytes) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", `/api/rfqs/${encodeURIComponent(id)}/upload`);
      xhr.setRequestHeader("Authorization", `Bearer ${uploadToken}`);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
      xhr.setRequestHeader("X-File-Size", String(file.size));
      xhr.upload.addEventListener("progress", (event) => {
        updateProgress(completedBytes, event.loaded, totalBytes, `Uploading ${file.name}`);
      });
      xhr.addEventListener("load", () => {
        let payload = {};
        try { payload = JSON.parse(xhr.responseText); } catch { payload = {}; }
        if (xhr.status >= 200 && xhr.status < 300) resolve(payload);
        else reject(new Error(payload.error || `Upload failed with status ${xhr.status}.`));
      });
      xhr.addEventListener("error", () => reject(new Error(`Network error while uploading ${file.name}.`)));
      xhr.send(file);
    });
  }

  document.querySelectorAll("[data-product]").forEach((button) => button.addEventListener("click", () => {
    productType = button.dataset.product;
    document.querySelectorAll("[data-product]").forEach((item) => item.classList.toggle("selected", item === button));
    updateSummary();
  }));
  document.querySelectorAll("[data-next]").forEach((button) => button.addEventListener("click", () => {
    if (currentStep === 1 && !validateBasics()) return;
    showStep(Number(button.dataset.next));
  }));
  document.querySelectorAll("[data-back]").forEach((button) => button.addEventListener("click", () => showStep(Number(button.dataset.back))));
  document.querySelectorAll("[data-step-button]").forEach((button) => button.addEventListener("click", () => {
    const nextStep = Number(button.dataset.stepButton);
    if (nextStep > 1 && !validateBasics()) return;
    showStep(nextStep);
  }));
  form.addEventListener("input", updateSummary);
  form.addEventListener("change", updateSummary);

  const dropzone = document.querySelector("#dropzone");
  const fileInput = document.querySelector("#fileInput");
  fileInput.addEventListener("change", () => {
    addFiles(fileInput.files || []);
    fileInput.value = "";
  });
  dropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInput.click();
    }
  });
  ["dragenter", "dragover"].forEach((type) => dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    dropzone.classList.add("dragging");
  }));
  ["dragleave", "drop"].forEach((type) => dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
  }));
  dropzone.addEventListener("drop", (event) => addFiles(event.dataTransfer?.files || []));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage("");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!selectedFiles.length) {
      showMessage("Please upload at least one PCB design file or archive.", "error");
      return;
    }

    const submit = document.querySelector("#submitRfq");
    submit.disabled = true;
    const totalBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    let completedBytes = 0;

    try {
      updateProgress(0, 0, totalBytes, "Creating secure RFQ…");
      const createResponse = await fetch("/api/rfqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: value("name"),
          email: value("email"),
          company: value("company"),
          targetDate: value("targetDate"),
          productType,
          notes: value("notes"),
          website: value("website"),
          quote: quoteData(),
        }),
      });
      const created = await createResponse.json();
      if (!createResponse.ok) throw new Error(created.error || "Unable to create the RFQ.");

      for (const file of selectedFiles) {
        await uploadFile(created, file, completedBytes, totalBytes);
        completedBytes += file.size;
      }
      updateProgress(totalBytes, 0, totalBytes, "Finalizing RFQ…");

      const completeResponse = await fetch(`/api/rfqs/${encodeURIComponent(created.id)}/complete`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${created.uploadToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: created.accessToken }),
      });
      const completed = await completeResponse.json();
      if (!completeResponse.ok) throw new Error(completed.error || "Unable to finalize the RFQ.");

      updateProgress(totalBytes, 0, totalBytes, "Secure upload complete");
      showMessage(`RFQ ${completed.id} was submitted successfully. HXLFAB sales and engineering have been notified.`, "success");
      submit.textContent = "RFQ submitted ✓";
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "The RFQ could not be submitted. Please retry.", "error");
      submit.disabled = false;
    }
  });

  updateSummary();
})();
