import hashlib
import hmac
import time
from urllib.parse import urlencode

from core.services.telegram import validate_init_data


def build_init_data(bot_token: str, auth_date: int | None = None, user: str = '{"id":1}') -> str:
    pairs = {
        "auth_date": str(auth_date or int(time.time())),
        "query_id": "AAExample",
        "user": user,
    }
    check_string = "\n".join(f"{key}={pairs[key]}" for key in sorted(pairs))
    secret = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    pairs["hash"] = hmac.new(secret, check_string.encode(), hashlib.sha256).hexdigest()
    return urlencode(pairs)


def test_valid_init_data_passes():
    token = "123456:TEST-TOKEN"
    data = build_init_data(token)
    result = validate_init_data(data, token)
    assert result is not None
    assert result["user"] == {"id": 1}


def test_wrong_token_rejected():
    data = build_init_data("123456:TEST-TOKEN")
    assert validate_init_data(data, "999:OTHER") is None


def test_stale_init_data_rejected():
    token = "123456:TEST-TOKEN"
    data = build_init_data(token, auth_date=int(time.time()) - 48 * 60 * 60)
    assert validate_init_data(data, token) is None


def test_empty_token_rejected():
    assert validate_init_data("auth_date=1&hash=abc", "") is None
