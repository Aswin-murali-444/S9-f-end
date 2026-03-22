from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Any, Dict, List, Optional, Tuple

from flask import Flask, jsonify, request


app = Flask(__name__)


@dataclass
class ProviderFeatures:
    id: Any
    service_id: Optional[Any] = None
    service_category_id: Optional[Any] = None
    rating: Optional[float] = None
    completed_jobs: Optional[int] = None
    cancelled_jobs: Optional[int] = None
    avg_response_minutes: Optional[float] = None
    current_active_jobs: Optional[int] = None
    distance_km: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "service_id": self.service_id,
            "service_category_id": self.service_category_id,
            "rating": self.rating,
            "completed_jobs": self.completed_jobs,
            "cancelled_jobs": self.cancelled_jobs,
            "avg_response_minutes": self.avg_response_minutes,
            "current_active_jobs": self.current_active_jobs,
            "distance_km": self.distance_km,
        }


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        if value is None:
            return default
        return int(value)
    except (TypeError, ValueError):
        return default


def _clip01(x: float) -> float:
    return max(0.0, min(1.0, float(x)))


def _cosine_similarity_dense(a: List[float], b: List[float]) -> float:
    """
    Cosine similarity for fixed-length dense vectors.
    Returned score is in [0, 1] for our non-negative feature vectors.
    """
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


def _cosine_similarity_sparse_dict(
    a: Dict[str, float], b: Dict[str, float], a_norm: Optional[float] = None, b_norm: Optional[float] = None
) -> float:
    """
    Cosine similarity between two sparse vectors represented as dicts.
    """
    if not a or not b:
        return 0.0

    # Compute dot over intersection only (sparse).
    # If we swap vectors to iterate over the smaller one, also swap provided norms.
    if len(a) > len(b):
        a, b = b, a
        a_norm, b_norm = b_norm, a_norm

    dot = 0.0
    for k, av in a.items():
        bv = b.get(k)
        if bv is not None:
            dot += float(av) * float(bv)

    if a_norm is None:
        a_norm = math.sqrt(sum(float(v) * float(v) for v in a.values()))
    if b_norm is None:
        b_norm = math.sqrt(sum(float(v) * float(v) for v in b.values()))

    if a_norm == 0.0 or b_norm == 0.0:
        return 0.0
    return dot / (a_norm * b_norm)


def score_provider(booking: Dict[str, Any], provider: ProviderFeatures) -> Tuple[float, Dict[str, Any]]:
    """
    Provider ranking using cosine similarity + KNN-style top-k selection.

    We build feature vectors for:
    - the "booking/user intent" (booking_vec)
    - each provider (provider_vec)

    Then we compute cosine similarity and the caller picks the top_k.
    """
    # ---- Compute provider "goodness" features in [0, 1] ----
    rating = _safe_float(provider.rating, 3.5)
    completed = max(_safe_int(provider.completed_jobs, 0), 0)
    cancelled = max(_safe_int(provider.cancelled_jobs, 0), 0)
    total_jobs = completed + cancelled

    completion_rate = completed / total_jobs if total_jobs > 0 else 0.7
    cancellation_rate = cancelled / total_jobs if total_jobs > 0 else 0.1

    avg_resp = _safe_float(provider.avg_response_minutes, 30.0)
    distance = _safe_float(provider.distance_km, 10.0)
    active_jobs = _safe_int(provider.current_active_jobs, 0)

    # Convert to "goodness" features (higher is better) for cosine matching.
    rating_good = _clip01((rating - 3.0) / 2.0)
    completion_good = _clip01(completion_rate)
    cancellation_good = _clip01(1.0 - cancellation_rate)
    response_good = _clip01(1.0 - avg_resp / 60.0)
    distance_good = _clip01(1.0 - distance / 25.0)
    load_good = _clip01(1.0 - active_jobs / 10.0)

    booking_service_id = booking.get("service_id")
    booking_category_id = booking.get("category_id")

    exact_match = 1.0 if (booking_service_id and provider.service_id == booking_service_id) else 0.0
    category_match = 1.0 if (
        not provider.service_id
        and booking_category_id
        and provider.service_category_id == booking_category_id
    ) else 0.0

    if exact_match > 0.5:
        match_type = "exact_service_match"
    elif category_match > 0.5:
        match_type = "category_match"
    else:
        match_type = "none"

    provider_vec = [
        rating_good,
        completion_good,
        cancellation_good,
        response_good,
        distance_good,
        load_good,
        exact_match,
        category_match,
    ]

    # "User intent" vector: we encourage all goodness dimensions + the relevant match dims.
    # Since we don't have explicit user preferences, we use a generic "high quality" target.
    exact_wanted = 1.0 if booking_service_id else 0.0
    category_wanted = 1.0 if booking_category_id else 0.0

    booking_vec = [
        1.0,  # rating target
        1.0,  # completion target
        1.0,  # cancellation target (goodness)
        1.0,  # response target
        1.0,  # distance target (closer -> higher distance_good)
        1.0,  # load target (less load -> higher load_good)
        exact_wanted,
        category_wanted,
    ]

    similarity = float(_cosine_similarity_dense(booking_vec, provider_vec))

    debug = {
        "match_type": match_type,
        "booking_vec": booking_vec,
        "provider_vec": provider_vec,
        "completion_rate": completion_rate,
        "cancellation_rate": cancellation_rate,
        "rating_good": rating_good,
        "completion_good": completion_good,
        "cancellation_good": cancellation_good,
        "response_good": response_good,
        "distance_good": distance_good,
        "load_good": load_good,
        "cosine_similarity": similarity,
    }

    return similarity, debug


@app.route("/rank-providers", methods=["POST"])
def rank_providers() -> Any:
    """
    Request body example:
    {
      "booking": { ... },
      "providers": [
        {
          "id": "uuid-1",
          "service_id": "svc-1",
          "service_category_id": "cat-1",
          "rating": 4.6,
          "completed_jobs": 20,
          "cancelled_jobs": 3,
          "avg_response_minutes": 12,
          "current_active_jobs": 1,
          "distance_km": 4.5
        }
      ],
      "top_k": 5
    }
    """
    payload = request.get_json(silent=True) or {}
    booking = payload.get("booking") or {}
    providers_raw = payload.get("providers") or []
    top_k = int(payload.get("top_k") or 5)

    if not isinstance(providers_raw, list) or len(providers_raw) == 0:
        return jsonify({"providers": [], "reason": "no_candidates"}), 200

    scored: List[Dict[str, Any]] = []
    for p in providers_raw:
        pf = ProviderFeatures(
            id=p.get("id"),
            service_id=p.get("service_id"),
            service_category_id=p.get("service_category_id"),
            rating=p.get("rating"),
            completed_jobs=p.get("completed_jobs"),
            cancelled_jobs=p.get("cancelled_jobs"),
            avg_response_minutes=p.get("avg_response_minutes"),
            current_active_jobs=p.get("current_active_jobs"),
            distance_km=p.get("distance_km"),
        )
        score, debug = score_provider(booking, pf)
        result = {
            **pf.to_dict(),
            "score": score,
            "details": debug,
        }
        scored.append(result)

    scored.sort(key=lambda x: x["score"], reverse=True)
    limited = scored[:top_k] if top_k > 0 else scored

    return jsonify(
        {
            "booking": booking,
            "providers": limited,
            "total_candidates": len(providers_raw),
        }
    )


def _parse_service_trends(raw: Any) -> Dict[str, Dict[str, float]]:
    """Normalize optional trend payload: { service_id: { recent, prior } } counts."""
    out: Dict[str, Dict[str, float]] = {}
    if not isinstance(raw, dict):
        return out
    for sid, row in raw.items():
        if sid is None:
            continue
        s = str(sid)
        if not isinstance(row, dict):
            continue
        recent = _safe_float(row.get("recent") or row.get("recent_count"), 0.0)
        prior = _safe_float(row.get("prior") or row.get("prior_count"), 0.0)
        out[s] = {"recent": recent, "prior": prior}
    return out


def _popularity_map(popular_services: List[Dict[str, Any]]) -> Tuple[Dict[str, float], float]:
    m: Dict[str, float] = {}
    for svc in popular_services or []:
        sid = svc.get("service_id")
        if sid is None:
            continue
        m[str(sid)] = float(svc.get("count") or 0.0)
    mx = max(m.values()) if m else 1.0
    if mx <= 0:
        mx = 1.0
    return m, mx


def _momentum(recent: float, prior: float) -> float:
    """Smoothed week-over-week style ratio; higher = more bookings in recent window."""
    return (recent + 0.5) / (prior + 0.5)


def _insight_from_components(
    p_norm: float,
    t_norm: float,
    pop_norm: float,
    momentum: float,
    recent: float,
    has_trend_data: bool,
    has_personalization: bool,
) -> Tuple[str, str]:
    """
    Human-readable reason for the recommendation (for product UI).
    Trend signals are surfaced first when strong so users see demand/momentum clearly.
    """
    if has_trend_data and recent >= 2.0 and momentum >= 1.4:
        return "trending", "Trending this week"
    if has_trend_data and recent >= 3.0 and t_norm >= 0.55:
        return "high_demand", "High demand lately"
    if has_trend_data and momentum >= 1.25 and recent >= 1.0:
        return "rising", "Rising interest"
    if has_personalization and p_norm >= 0.38 and p_norm >= max(t_norm, pop_norm) - 0.08:
        return "personalized", "Aligned with your activity"
    if pop_norm >= 0.65:
        return "popular", "Popular with customers"
    if has_trend_data and t_norm >= 0.5:
        return "momentum", "Strong booking momentum"
    if has_personalization:
        return "match", "Matches your profile"
    return "recommended", "Recommended for you"


def _blend_recommendations(
    personal_pairs: List[Tuple[str, float]],
    service_trends: Dict[str, Dict[str, float]],
    popular_services: List[Dict[str, Any]],
    limit: int,
    history_set: set,
    has_personalization: bool,
) -> List[Dict[str, Any]]:
    """
    Combine personalization (cosine / co-occurrence), platform trend momentum,
    and overall popularity into a single score and attach insight labels.
    """
    limit = max(1, limit)
    pop_map, max_pop = _popularity_map(popular_services)

    # Normalize personalization scores across this candidate batch
    pers_vals = [float(p[1]) for p in personal_pairs]
    p_min = min(pers_vals) if pers_vals else 0.0
    p_max = max(pers_vals) if pers_vals else 1.0
    p_span = (p_max - p_min) if (p_max > p_min) else 1.0

    # Trend signal: log-momentum, then min-max normalize across candidates
    log_moms: List[float] = []
    rows: List[Tuple[str, float, float, float, float, float, float]] = []
    for sid, raw_p in personal_pairs:
        if sid in history_set:
            continue
        tr = service_trends.get(sid, {})
        recent = float(tr.get("recent", 0.0))
        prior = float(tr.get("prior", 0.0))
        mom = _momentum(recent, prior)
        lm = math.log1p(mom)
        log_moms.append(lm)
        pop = pop_map.get(sid, 0.0) / max_pop
        p_norm = (float(raw_p) - p_min) / p_span
        rows.append((sid, raw_p, p_norm, lm, pop, recent, prior))

    if not rows:
        return []

    has_trend_data = bool(service_trends)

    if log_moms:
        lm_min, lm_max = min(log_moms), max(log_moms)
        lm_span = (lm_max - lm_min) if (lm_max > lm_min) else 1.0
    else:
        lm_min, lm_max, lm_span = 0.0, 1.0, 1.0

    # Weights: personalization + platform trend momentum + global popularity
    if has_personalization:
        w_p, w_t, w_pop = 0.52, 0.33, 0.15
    else:
        w_p, w_t, w_pop = 0.15, 0.45, 0.40

    if not has_trend_data:
        w_t = 0.0
    s = w_p + w_t + w_pop
    if s > 0:
        w_p, w_t, w_pop = w_p / s, w_t / s, w_pop / s

    blended: List[Dict[str, Any]] = []
    for sid, raw_p, p_norm, lm, pop, recent, prior in rows:
        t_norm = (lm - lm_min) / lm_span if has_trend_data and log_moms else 0.0
        combined = w_p * p_norm + w_t * t_norm + w_pop * pop
        insight_key, insight_label = _insight_from_components(
            p_norm, t_norm, pop, _momentum(recent, prior), recent, has_trend_data, has_personalization
        )
        blended.append(
            {
                "service_id": sid,
                "score": float(combined),
                "components": {
                    "personalization": round(p_norm, 4),
                    "trend": round(t_norm, 4),
                    "popularity": round(pop, 4),
                    "raw_personal": round(float(raw_p), 6),
                    "momentum": round(_momentum(recent, prior), 4),
                    "recent_window_bookings": int(recent),
                    "prior_window_bookings": int(prior),
                },
                "insight_key": insight_key,
                "insight_label": insight_label,
            }
        )

    blended.sort(key=lambda x: x["score"], reverse=True)
    return blended[:limit]


def recommend_services_logic(
    user_id: Any,
    current_service_id: Optional[Any],
    user_history: List[Any],
    global_cooccurrence: Dict[str, Dict[str, int]],
    popular_services: List[Dict[str, Any]],
    limit: int = 5,
    service_trends: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Item-item CF with cosine similarity, blended with trend momentum and popularity.

    Optional `service_trends`: { service_id: { "recent": n7, "prior": p7 } }
    counts (e.g. bookings last 7 days vs previous 7 days) for demand signals.
    """
    limit = max(1, limit)
    trends = _parse_service_trends(service_trends)

    # Build sparse service co-occurrence vectors (keys are service_id strings).
    service_vecs: Dict[str, Dict[str, float]] = {}
    for sid, row in (global_cooccurrence or {}).items():
        if sid is None:
            continue
        sid_str = str(sid)
        if not isinstance(row, dict) or not row:
            service_vecs[sid_str] = {}
            continue
        service_vecs[sid_str] = {str(k): float(v) for k, v in row.items() if k is not None and v is not None}

    # If we have neither history nor co-occurrence vectors, fall back to popularity.
    history_ids = [str(sid) for sid in user_history if sid is not None]
    history_set = set(history_ids)

    current_str = str(current_service_id) if current_service_id is not None else None
    if (not history_ids) and (not current_str):
        # popularity-only fallback — still rank with trend + popularity blend
        used_set = history_set
        pairs: List[Tuple[str, float]] = []
        for svc in popular_services or []:
            sid = str(svc.get("service_id"))
            if not sid or sid in used_set:
                continue
            pairs.append((sid, float(svc.get("count") or 0.0)))
        return _blend_recommendations(pairs, trends, popular_services, limit, history_set, has_personalization=False)

    # Construct a user profile vector in sparse dict form.
    # We weight current_service_id higher, then add history services.
    user_vec: Dict[str, float] = {}

    def _add_vec(target: Dict[str, float], vec: Dict[str, float], weight: float) -> None:
        for k, v in vec.items():
            target[k] = target.get(k, 0.0) + weight * float(v)

    if current_str and current_str in service_vecs:
        _add_vec(user_vec, service_vecs[current_str], weight=2.0)

    # Add each history item's co-occurrence row with smaller weight.
    # This gives a "what you often buy together" profile.
    for sid in history_ids:
        if sid in service_vecs:
            _add_vec(user_vec, service_vecs[sid], weight=1.0)

    if not user_vec:
        # Nothing to compare - fallback to popularity with trend blend.
        used_set = history_set
        pairs = []
        for svc in popular_services or []:
            sid = str(svc.get("service_id"))
            if not sid or sid in used_set:
                continue
            pairs.append((sid, float(svc.get("count") or 0.0)))
        return _blend_recommendations(pairs, trends, popular_services, limit, history_set, has_personalization=False)

    # Precompute user norm once.
    user_norm = math.sqrt(sum(float(v) * float(v) for v in user_vec.values()))
    if user_norm == 0.0:
        return []

    # Candidate services: union of:
    # - global co-occurrence rows
    # - popularity list (to ensure we can recommend popular items even if vectors are empty)
    candidate_set = set(service_vecs.keys())
    for svc in popular_services or []:
        sid = svc.get("service_id")
        if sid is not None:
            candidate_set.add(str(sid))

    # KNN (top-k nearest) via cosine similarity — take more than limit for re-ranking
    scored: List[Tuple[str, float]] = []
    for sid in candidate_set:
        if sid in history_set:
            continue
        vec = service_vecs.get(sid, {})
        sim = _cosine_similarity_sparse_dict(vec, user_vec, b_norm=user_norm)
        scored.append((sid, sim))

    scored.sort(key=lambda kv: kv[1], reverse=True)
    pool = scored[: max(limit * 4, limit + 8)]
    return _blend_recommendations(pool, trends, popular_services, limit, history_set, has_personalization=True)


@app.route("/recommend-services", methods=["POST"])
def recommend_services() -> Any:
    """
    Request body example:
    {
      "user_id": "uuid-1",
      "current_service_id": "svc-10",
      "user_history": ["svc-1", "svc-2", "svc-3"],
      "global_cooccurrence": {
        "svc-1": { "svc-2": 5, "svc-3": 2 }
      },
      "popular_services": [
        {"service_id": "svc-10", "count": 120},
        {"service_id": "svc-2", "count": 80}
      ],
      "limit": 5
    }
    """
    payload = request.get_json(silent=True) or {}
    user_id = payload.get("user_id")
    current_service_id = payload.get("current_service_id")
    user_history = payload.get("user_history") or []
    global_cooccurrence = payload.get("global_cooccurrence") or {}
    popular_services = payload.get("popular_services") or []
    service_trends = payload.get("service_trends") or payload.get("serviceTrends") or {}
    limit = int(payload.get("limit") or 5)

    if not isinstance(user_history, list):
        user_history = []

    if not isinstance(global_cooccurrence, dict):
        global_cooccurrence = {}

    if not isinstance(popular_services, list):
        popular_services = []

    if not isinstance(service_trends, dict):
        service_trends = {}

    recommendations = recommend_services_logic(
        user_id=user_id,
        current_service_id=current_service_id,
        user_history=user_history,
        global_cooccurrence=global_cooccurrence,
        popular_services=popular_services,
        limit=limit,
        service_trends=service_trends,
    )

    return jsonify(
        {
            "user_id": user_id,
            "current_service_id": current_service_id,
            "recommendations": recommendations,
        }
    )


@app.route("/health", methods=["GET"])
def health() -> Any:
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    # Default to port 5000 to avoid clashing with Node backend
    app.run(host="0.0.0.0", port=5000)

