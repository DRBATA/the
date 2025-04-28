import yaml, os, re
import requests

API_URL = "http://localhost:8000/api/chat"  # Update this to your dev endpoint

def call_backend(prompt):
    resp = requests.post(API_URL, json={"user_id": "test", "message": prompt}, timeout=30)
    try:
        return resp.json()
    except Exception:
        return {"answer": resp.text}

def test_gold():
    with open("tests/gold/gold_prompts.yaml") as f:
        gold = yaml.safe_load(f)["tests"]
    for case in gold:
        out = call_backend(case["prompt"])
        answer = out.get("answer", "")
        if case.get("expect_json"):
            # Basic containment check for tool calls
            expect = case["expect_json"]
            for k, v in expect.items():
                assert str(v) in str(out), f"{k} missing"
        if case.get("must_contain"):
            for word in case["must_contain"]:
                assert word.lower() in answer.lower(), f"Missing: {word}"
        if case.get("must_contain_regex"):
            assert re.search(case["must_contain_regex"], answer, re.I)
        if case.get("should_fail"):
            assert "error" in answer.lower() or "unable" in answer.lower()
