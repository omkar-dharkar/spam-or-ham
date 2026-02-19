from flask import Flask, render_template, request
import pickle

app = Flask(__name__)

# Load saved files
model = pickle.load(open("logistic_regression.pkl", "rb"))
feature_extraction = pickle.load(open("feature_extraction.pkl", "rb"))

def predict_mail(input_text: str):
    input_user_mail = [input_text]
    input_data_features = feature_extraction.transform(input_user_mail)

    pred = model.predict(input_data_features)
    label = int(pred[0])  # 0 = spam, 1 = ham

    confidence = None
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(input_data_features)[0]
        # assumes classes are [0, 1]
        confidence = float(proba[label])

    return label, confidence

@app.route("/", methods=["GET", "POST"])
def analyze_mail():
    if request.method == "POST":
        mail = (request.form.get("mail") or "").strip()

        if not mail:
            return render_template(
                "index.html",
                mail="",
                classify=None,
                confidence=None
            )

        label, confidence = predict_mail(mail)

        return render_template(
            "index.html",
            mail=mail,
            classify=label,
            confidence=confidence
        )

    # IMPORTANT: always pass these to avoid Jinja undefined errors
    return render_template("index.html", mail="", classify=None, confidence=None)

if __name__ == "__main__":
    app.run(debug=True)
