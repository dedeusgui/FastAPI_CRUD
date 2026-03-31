def _create_and_login(client, register_user, login_user, name, email, password):
    register_user(name=name, email=email, password=password)
    _, token = login_user(email, password)
    me = client.get("/users/me", cookies={"access_token": token})
    return token, me.json()["data"]["user"]["id"]


def _task_list(response):
    return response.json()["data"]["tasks"]


def _task_item(response):
    return response.json()["data"]["task"]


def _error_payload(response):
    return response.json()["error"]


def test_create_task_links_to_authenticated_user(client, register_user, login_user):
    token, user_id = _create_and_login(
        client,
        register_user,
        login_user,
        name="Task Owner",
        email="owner@example.com",
        password="testpassword",
    )

    response = client.post(
        "/tasks/create",
        json={"title": "My Task", "description": "Desc"},
        cookies={"access_token": token},
    )
    tasks_response = client.get("/tasks/", cookies={"access_token": token})
    created_task = _task_item(response)
    task_list = _task_list(tasks_response)

    assert response.status_code == 201
    assert tasks_response.status_code == 200
    assert len(task_list) == 1
    assert created_task["id"] == task_list[0]["id"]
    assert task_list[0]["title"] == "My Task"
    assert "user_id" not in created_task
    assert "user_id" not in task_list[0]


def test_get_tasks_returns_only_authenticated_user_tasks(
    client, register_user, login_user
):
    token_user_1, _ = _create_and_login(
        client,
        register_user,
        login_user,
        name="User One",
        email="user1@example.com",
        password="testpassword",
    )
    token_user_2, _ = _create_and_login(
        client,
        register_user,
        login_user,
        name="User Two",
        email="user2@example.com",
        password="testpassword",
    )

    client.post(
        "/tasks/create",
        json={"title": "Task U1", "description": "A"},
        cookies={"access_token": token_user_1},
    )
    client.post(
        "/tasks/create",
        json={"title": "Task U2", "description": "B"},
        cookies={"access_token": token_user_2},
    )

    response_user_1 = client.get("/tasks/", cookies={"access_token": token_user_1})
    task_list = _task_list(response_user_1)

    assert response_user_1.status_code == 200
    assert len(task_list) == 1
    assert task_list[0]["title"] == "Task U1"


def test_complete_task_success_for_owner(client, register_user, login_user):
    token, _ = _create_and_login(
        client,
        register_user,
        login_user,
        name="Owner",
        email="owner@example.com",
        password="testpassword",
    )

    client.post(
        "/tasks/create",
        json={"title": "To Complete", "description": "desc"},
        cookies={"access_token": token},
    )
    task_id = _task_list(client.get("/tasks/", cookies={"access_token": token}))[0]["id"]

    response = client.post(
        f"/tasks/complete/{task_id}", cookies={"access_token": token}
    )
    completed_task = _task_item(response)

    assert response.status_code == 200
    assert completed_task["completed"] is True


def test_complete_task_other_user_returns_403(client, register_user, login_user):
    token_owner, _ = _create_and_login(
        client,
        register_user,
        login_user,
        name="Owner",
        email="owner@example.com",
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
        "/tasks/create",
        json={"title": "Protected Task", "description": "desc"},
        cookies={"access_token": token_owner},
    )
    task_id = _task_list(client.get("/tasks/", cookies={"access_token": token_owner}))[
        0
    ]["id"]

    response = client.post(
        f"/tasks/complete/{task_id}",
        cookies={"access_token": token_other},
    )

    assert response.status_code == 403
    assert _error_payload(response) == {
        "code": "TASK_FORBIDDEN",
        "message": "Unauthorized",
        "detail": None,
        "fields": [],
    }


def test_complete_task_not_found_returns_404(client, register_user, login_user):
    token, _ = _create_and_login(
        client,
        register_user,
        login_user,
        name="Owner",
        email="owner@example.com",
        password="testpassword",
    )

    response = client.post("/tasks/complete/999", cookies={"access_token": token})

    assert response.status_code == 404
    assert _error_payload(response) == {
        "code": "TASK_NOT_FOUND",
        "message": "Task not found",
        "detail": None,
        "fields": [],
    }


def test_update_task_full_and_partial_for_owner(client, register_user, login_user):
    token, _ = _create_and_login(
        client,
        register_user,
        login_user,
        name="Owner",
        email="owner@example.com",
        password="testpassword",
    )

    client.post(
        "/tasks/create",
        json={"title": "Original", "description": "Original Desc"},
        cookies={"access_token": token},
    )
    task_id = _task_list(client.get("/tasks/", cookies={"access_token": token}))[0]["id"]

    update_both = client.patch(
        f"/tasks/update/{task_id}",
        json={"title": "New Title", "description": "New Desc"},
        cookies={"access_token": token},
    )
    update_partial = client.patch(
        f"/tasks/update/{task_id}",
        json={"title": "Only Title"},
        cookies={"access_token": token},
    )
    task_after = _task_item(update_partial)

    assert update_both.status_code == 200
    assert update_partial.status_code == 200
    assert task_after["title"] == "Only Title"
    assert task_after["description"] == "New Desc"


def test_update_task_other_user_returns_403(client, register_user, login_user):
    token_owner, _ = _create_and_login(
        client,
        register_user,
        login_user,
        name="Owner",
        email="owner@example.com",
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
        "/tasks/create",
        json={"title": "Owner Task", "description": "Desc"},
        cookies={"access_token": token_owner},
    )
    task_id = _task_list(client.get("/tasks/", cookies={"access_token": token_owner}))[
        0
    ]["id"]

    response = client.patch(
        f"/tasks/update/{task_id}",
        json={"title": "Attempted Edit"},
        cookies={"access_token": token_other},
    )

    assert response.status_code == 403
    assert _error_payload(response) == {
        "code": "TASK_FORBIDDEN",
        "message": "Unauthorized",
        "detail": None,
        "fields": [],
    }


def test_delete_task_success_for_owner(client, register_user, login_user):
    token, _ = _create_and_login(
        client,
        register_user,
        login_user,
        name="Owner",
        email="owner@example.com",
        password="testpassword",
    )

    client.post(
        "/tasks/create",
        json={"title": "Delete Me", "description": "Desc"},
        cookies={"access_token": token},
    )
    task_id = _task_list(client.get("/tasks/", cookies={"access_token": token}))[0]["id"]

    response = client.delete(
        f"/tasks/delete/{task_id}", cookies={"access_token": token}
    )
    tasks_after = _task_list(client.get("/tasks/", cookies={"access_token": token}))

    assert response.status_code == 200
    assert response.json() == {
        "data": None,
        "message": "Task deleted successfully",
    }
    assert tasks_after == []


def test_delete_task_other_user_returns_403(client, register_user, login_user):
    token_owner, _ = _create_and_login(
        client,
        register_user,
        login_user,
        name="Owner",
        email="owner@example.com",
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
        "/tasks/create",
        json={"title": "Owner Task", "description": "Desc"},
        cookies={"access_token": token_owner},
    )
    task_id = _task_list(client.get("/tasks/", cookies={"access_token": token_owner}))[
        0
    ]["id"]

    response = client.delete(
        f"/tasks/delete/{task_id}",
        cookies={"access_token": token_other},
    )

    assert response.status_code == 403
    assert _error_payload(response) == {
        "code": "TASK_FORBIDDEN",
        "message": "Unauthorized",
        "detail": None,
        "fields": [],
    }


def test_task_endpoints_require_valid_cookie(client):
    unauth_create = client.post(
        "/tasks/create",
        json={"title": "No Auth", "description": "Desc"},
    )
    invalid_list = client.get("/tasks/", cookies={"access_token": "invalid-token"})

    assert unauth_create.status_code == 401
    assert _error_payload(unauth_create) == {
        "code": "AUTH_NOT_AUTHENTICATED",
        "message": "Not authenticated",
        "detail": None,
        "fields": [],
    }
    assert invalid_list.status_code == 401
    assert _error_payload(invalid_list) == {
        "code": "AUTH_INVALID_TOKEN",
        "message": "Invalid token",
        "detail": None,
        "fields": [],
    }


def test_create_task_without_title_returns_422(client, register_user, login_user):
    token, _ = _create_and_login(
        client,
        register_user,
        login_user,
        name="Owner",
        email="owner@example.com",
        password="testpassword",
    )

    response = client.post(
        "/tasks/create",
        json={"description": "missing title"},
        cookies={"access_token": token},
    )

    assert response.status_code == 422
    assert _error_payload(response)["code"] == "VALIDATION_ERROR"
    assert {field["field"] for field in _error_payload(response)["fields"]} == {
        "title"
    }


def test_patch_task_with_empty_payload_does_not_raise_500(
    client, register_user, login_user
):
    token, _ = _create_and_login(
        client,
        register_user,
        login_user,
        name="Owner",
        email="owner@example.com",
        password="testpassword",
    )

    client.post(
        "/tasks/create",
        json={"title": "Task", "description": "Desc"},
        cookies={"access_token": token},
    )
    task_id = _task_list(client.get("/tasks/", cookies={"access_token": token}))[0]["id"]

    response = client.patch(
        f"/tasks/update/{task_id}",
        json={},
        cookies={"access_token": token},
    )

    assert response.status_code == 200
    assert _task_item(response) == {
        "id": task_id,
        "title": "Task",
        "description": "Desc",
        "completed": False,
    }
