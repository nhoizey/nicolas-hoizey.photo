const rangeInput = document.querySelector("#mintags");
const currentLabel = document.querySelector("#current");
const cloud = document.querySelector("#tagscloud");

let max = 0;
const tags = document.querySelectorAll("[data-number]");
for (const tag of tags) {
	max = Math.max(max, Number.parseInt(tag.dataset.number, 10));
}
rangeInput.max = max;
cloud.style.setProperty("--max-log", Math.log(max));

const updateLabel = () => {
	const currentValue = rangeInput.value;
	currentLabel.innerText = `Currently showing tags used with at least ${currentValue} photo${
		currentValue > 1 ? "s" : ""
	}:`;
	let newMinLog = 100;
	for (const tag of tags) {
		if (Number.parseInt(tag.dataset.number, 10) >= currentValue) {
			tag.style.display = "inline-block";
			newMinLog = Math.min(newMinLog, tag.style.getPropertyValue("--log"));
		} else {
			tag.style.display = "none";
		}
	}
	cloud.style.setProperty("--min-log", newMinLog);
};

rangeInput.addEventListener("input", updateLabel);
updateLabel();

document.querySelector("#dynamic").style.display = "block";
