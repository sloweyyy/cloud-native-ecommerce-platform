using Common.Exceptions;
using Microsoft.Extensions.Logging.Abstractions;
using Ordering.Application.Commands;
using Ordering.Application.Exceptions;
using Ordering.Application.Handlers;
using Ordering.Application.Mappers;
using Ordering.Core.Entities;
using Ordering.Core.Repositories;

namespace Ordering.Application.Tests;

public class OrderCommandHandlerTests
{
    private readonly IOrderRepository _repository = Substitute.For<IOrderRepository>();
    private readonly OrderMapper _mapper = new();

    [Fact]
    public async Task Update_of_missing_order_throws_not_found()
    {
        _repository.GetByIdAsync(42).Returns((Order)null!);
        var handler = new UpdateOrderCommandHandler(_repository, _mapper, NullLogger<UpdateOrderCommandHandler>.Instance);

        var ex = await Should.ThrowAsync<OrderNotFoundException>(
            () => handler.Handle(new UpdateOrderCommand { Id = 42 }, CancellationToken.None));

        // Must be a NotFoundException so the shared handler maps it to 404.
        ex.ShouldBeAssignableTo<NotFoundException>();
        ex.Message.ShouldBe("Entity Order - 42 is not found.");
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<Order>());
    }

    [Fact]
    public async Task Delete_of_missing_order_throws_not_found()
    {
        _repository.GetByIdAsync(7).Returns((Order)null!);
        var handler = new DeleteOrderCommandHandler(_repository, NullLogger<DeleteOrderCommandHandler>.Instance);

        await Should.ThrowAsync<NotFoundException>(
            () => handler.Handle(new DeleteOrderCommand { Id = 7 }, CancellationToken.None));

        await _repository.DidNotReceive().DeleteAsync(Arg.Any<Order>());
    }

    [Fact]
    public async Task Delete_of_existing_order_deletes_it()
    {
        var order = new PersistedOrder(7) { UserName = "alice" };
        _repository.GetByIdAsync(7).Returns(order);
        var handler = new DeleteOrderCommandHandler(_repository, NullLogger<DeleteOrderCommandHandler>.Instance);

        await handler.Handle(new DeleteOrderCommand { Id = 7 }, CancellationToken.None);

        await _repository.Received(1).DeleteAsync(order);
    }

    [Fact]
    public async Task Checkout_persists_the_order_and_returns_its_id()
    {
        _repository.AddAsync(Arg.Any<Order>()).Returns(new PersistedOrder(99));
        var handler = new CheckoutOrderCommandHandler(_repository, _mapper, NullLogger<CheckoutOrderCommandHandler>.Instance);

        var id = await handler.Handle(new CheckoutOrderCommand { UserName = "alice", TotalPrice = 0m }, CancellationToken.None);

        id.ShouldBe(99);
        await _repository.Received(1).AddAsync(Arg.Is<Order>(o => o.UserName == "alice" && o.TotalPrice == 0m));
    }

    // EntityBase.Id has a protected setter (database-generated).
    private sealed class PersistedOrder : Order
    {
        public PersistedOrder(int id) => Id = id;
    }
}
