def _create_and_login(client, register_user, login_user, name, email, password):
    register_user(name=name, email=email, password=password)
    _, token = login_user(email, password)
    me = client.get("/users/me", cookies={"access_token": token})
    return token, me.json()["id"]


def test_send_friend_request_success(client, register_user, login_user):
    token_requester, requester_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Requester",
        email="requester@example.com",
        password="testpassword",
    )
    _, receiver_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Receiver",
        email="receiver@example.com",
        password="testpassword",
    )

    response = client.post(
        f"/friends/request/{receiver_id}",
        cookies={"access_token": token_requester},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["requester_id"] == requester_id
    assert data["receiver_id"] == receiver_id
    assert data["status"] == "pending"


def test_send_friend_request_to_self_returns_400(client, register_user, login_user):
    token, user_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Self",
        email="self@example.com",
        password="testpassword",
    )

    response = client.post(
        f"/friends/request/{user_id}", cookies={"access_token": token}
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Cannot send friend request to oneself."}


def test_send_duplicate_friend_request_returns_400(client, register_user, login_user):
    token_requester, requester_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Requester",
        email="requester@example.com",
        password="testpassword",
    )
    _, receiver_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Receiver",
        email="receiver@example.com",
        password="testpassword",
    )

    client.post(
        f"/friends/request/{receiver_id}", cookies={"access_token": token_requester}
    )

    response = client.post(
        f"/friends/request/{receiver_id}",
        cookies={"access_token": token_requester},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Friend request already exists."}


def test_send_friend_request_nonexistent_user_returns_404(
    client, register_user, login_user
):
    token_requester, _ = _create_and_login(
        client,
        register_user,
        login_user,
        name="Requester",
        email="requester@example.com",
        password="testpassword",
    )

    response = client.post(
        "/friends/request/999",
        cookies={"access_token": token_requester},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Friend user not found."}


def test_accept_friend_request_success(client, register_user, login_user):
    token_requester, requester_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Requester",
        email="requester@example.com",
        password="testpassword",
    )
    token_receiver, receiver_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Receiver",
        email="receiver@example.com",
        password="testpassword",
    )

    client.post(
        f"/friends/request/{receiver_id}", cookies={"access_token": token_requester}
    )

    response = client.post(
        f"/friends/accept/{requester_id}",
        cookies={"access_token": token_receiver},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "accepted"


def test_accept_own_request_returns_400(client, register_user, login_user):
    token_requester, requester_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Requester",
        email="requester@example.com",
        password="testpassword",
    )
    _, receiver_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Receiver",
        email="receiver@example.com",
        password="testpassword",
    )

    client.post(
        f"/friends/request/{receiver_id}", cookies={"access_token": token_requester}
    )

    response = client.post(
        f"/friends/accept/{requester_id}",
        cookies={"access_token": token_requester},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Cannot accept your own request."}


def test_accept_nonexistent_request_returns_404(client, register_user, login_user):
    token_receiver, receiver_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Receiver",
        email="receiver@example.com",
        password="testpassword",
    )

    response = client.post(
        "/friends/accept/999",
        cookies={"access_token": token_receiver},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Friend request not found."}


def test_refuse_friend_request_success(client, register_user, login_user):
    token_requester, requester_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Requester",
        email="requester@example.com",
        password="testpassword",
    )
    token_receiver, receiver_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Receiver",
        email="receiver@example.com",
        password="testpassword",
    )

    client.post(
        f"/friends/request/{receiver_id}", cookies={"access_token": token_requester}
    )

    response = client.post(
        f"/friends/refuse/{requester_id}",
        cookies={"access_token": token_receiver},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "refused"


def test_refuse_own_request_returns_400(client, register_user, login_user):
    token_requester, requester_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Requester",
        email="requester@example.com",
        password="testpassword",
    )
    _, receiver_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Receiver",
        email="receiver@example.com",
        password="testpassword",
    )

    client.post(
        f"/friends/request/{receiver_id}", cookies={"access_token": token_requester}
    )

    response = client.post(
        f"/friends/refuse/{requester_id}",
        cookies={"access_token": token_requester},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Cannot refuse your own request."}


def test_status_returns_pending_and_accepted(client, register_user, login_user):
    token_requester, requester_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Requester",
        email="requester@example.com",
        password="testpassword",
    )
    token_receiver, receiver_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Receiver",
        email="receiver@example.com",
        password="testpassword",
    )

    client.post(
        f"/friends/request/{receiver_id}", cookies={"access_token": token_requester}
    )

    pending_status = client.get(
        f"/friends/status/{receiver_id}",
        cookies={"access_token": token_requester},
    )

    client.post(
        f"/friends/accept/{requester_id}", cookies={"access_token": token_receiver}
    )

    accepted_status = client.get(
        f"/friends/status/{receiver_id}",
        cookies={"access_token": token_requester},
    )

    assert pending_status.status_code == 200
    assert pending_status.json() == "pending"
    assert accepted_status.status_code == 200
    assert accepted_status.json() == "accepted"


def test_get_pending_requests_returns_only_user_pending(
    client, register_user, login_user
):
    token_requester, requester_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Requester",
        email="requester@example.com",
        password="testpassword",
    )
    token_receiver, receiver_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Receiver",
        email="receiver@example.com",
        password="testpassword",
    )
    token_other, _ = _create_and_login(
        client,
        register_user,
        login_user,
        name="Other",
        email="other@example.com",
        password="testpassword",
    )

    client.post(
        f"/friends/request/{receiver_id}", cookies={"access_token": token_requester}
    )

    own_pending = client.get(
        "/friends/pending-requests",
        cookies={"access_token": token_receiver},
    )
    other_pending = client.get(
        "/friends/pending-requests",
        cookies={"access_token": token_other},
    )

    assert own_pending.status_code == 200
    assert len(own_pending.json()) == 1
    assert "id" in own_pending.json()[0]
    assert own_pending.json()[0]["status"] == "pending"
    assert own_pending.json()[0]["requester_id"] == requester_id
    assert other_pending.status_code == 200
    assert other_pending.json() == []


def test_remove_friendship_success_and_forbidden(client, register_user, login_user):
    token_requester, requester_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Requester",
        email="requester@example.com",
        password="testpassword",
    )
    token_receiver, receiver_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Receiver",
        email="receiver@example.com",
        password="testpassword",
    )
    token_other, _ = _create_and_login(
        client,
        register_user,
        login_user,
        name="Other",
        email="other@example.com",
        password="testpassword",
    )

    client.post(
        f"/friends/request/{receiver_id}", cookies={"access_token": token_requester}
    )

    forbidden_remove = client.request(
        "DELETE",
        f"/friends/remove/{requester_id}",
        cookies={"access_token": token_other},
    )

    success_remove = client.request(
        "DELETE",
        f"/friends/remove/{requester_id}",
        cookies={"access_token": token_receiver},
    )

    status_after_remove = client.get(
        f"/friends/status/{receiver_id}",
        cookies={"access_token": token_requester},
    )

    assert forbidden_remove.status_code == 404
    assert forbidden_remove.json() == {"detail": "Friendship not found."}
    assert success_remove.status_code == 204
    assert status_after_remove.status_code == 404
    assert status_after_remove.json() == {"detail": "Friendship not found."}


def test_get_friendship_status_not_found_returns_404(client, register_user, login_user):
    token, requester_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Requester",
        email="requester@example.com",
        password="testpassword",
    )
    _, receiver_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Receiver",
        email="receiver@example.com",
        password="testpassword",
    )

    response = client.get(
        f"/friends/status/{receiver_id}",
        cookies={"access_token": token},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Friendship not found."}


def test_get_friends_returns_only_accepted_friends(client, register_user, login_user):
    token_requester, requester_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Requester",
        email="requester@example.com",
        password="testpassword",
    )
    token_receiver, receiver_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Receiver",
        email="receiver@example.com",
        password="testpassword",
    )
    token_other, other_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Other",
        email="other@example.com",
        password="testpassword",
    )

    client.post(
        f"/friends/request/{receiver_id}", cookies={"access_token": token_requester}
    )
    client.post(
        f"/friends/accept/{requester_id}", cookies={"access_token": token_receiver}
    )

    client.post(
        f"/friends/request/{requester_id}", cookies={"access_token": token_other}
    )

    response = client.get("/friends", cookies={"access_token": token_requester})

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == receiver_id


def test_get_friends_without_relationships_returns_empty_list(
    client, register_user, login_user
):
    token, _ = _create_and_login(
        client,
        register_user,
        login_user,
        name="Requester",
        email="requester@example.com",
        password="testpassword",
    )

    response = client.get("/friends", cookies={"access_token": token})

    assert response.status_code == 200
    assert response.json() == []
