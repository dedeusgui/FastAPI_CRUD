import pytest


def calc(a, b):
    return a + b


def test_calc():
    assert calc(2, 3) == 5
