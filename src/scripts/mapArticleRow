const mapArticleRow = (rows) => {
  return rows.map((row) => {
    const vendorName =
      row.childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
        .childNodes[2].childNodes[0].innerText;

    const vendorLocation =
      row.childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1]
        .getAttribute("aria-label")
        .substr(24);

    const vendorType =
      row.childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[3]?.childNodes[0]?.childNodes[0]?.getAttribute(
        "aria-label"
      );

    const setName =
      row.childNodes[2].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute(
        "aria-label"
      );

    const type =
      row.childNodes[2].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[1].getAttribute(
        "aria-label"
      );

    const condition =
      row.childNodes[2].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[2].getAttribute(
        "data-bs-original-title"
      );

    const language =
      row.childNodes[2].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[3].getAttribute(
        "aria-label"
      );

    const specialAttribute =
      row.childNodes[2].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[4]?.getAttribute(
        "aria-label"
      );

    const description =
      row.childNodes[2].childNodes[0].childNodes[1].childNodes[0].childNodes[1]
        .getAttribute("class")
        .includes("product-comments")
        ? row.childNodes[2].childNodes[0].childNodes[1].childNodes[0]
            .childNodes[1].innerText
        : undefined;

    const price = Number(
      row.childNodes[3].childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerText
        ?.replace(" €", "")
        ?.replace(",", ".")
    );

    const quantity = Number(
      row.childNodes[3].childNodes[1]?.innerText
        ?.replace(" €", "")
        ?.replace(",", ".")
    );

    return {
      vendorName,
      vendorLocation,
      vendorType,
      setName,
      type,
      condition,
      language,
      specialAttribute,
      description,
      price,
      quantity,
    };
  });
};

module.exports = mapArticleRow;
