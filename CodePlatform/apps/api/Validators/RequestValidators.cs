using CodeQuest.Api.DTOs;
using FluentValidation;

namespace CodeQuest.Api.Validators;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(80);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(200);
    }
}

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public sealed class CreateClassroomRequestValidator : AbstractValidator<CreateClassroomRequest>
{
    public CreateClassroomRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Description).MaximumLength(500);
    }
}

public sealed class JoinClassRequestValidator : AbstractValidator<JoinClassRequest>
{
    public JoinClassRequestValidator()
    {
        RuleFor(x => x.InviteCode).NotEmpty().Length(4, 16);
    }
}

public sealed class CreateExerciseRequestValidator : AbstractValidator<CreateExerciseRequest>
{
    public CreateExerciseRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.XpReward).InclusiveBetween(0, 1000);
        RuleFor(x => x.StarterCode).MaximumLength(20000);
        RuleFor(x => x.ReferenceSolution).MaximumLength(20000);
        RuleForEach(x => x.Tests).ChildRules(test =>
        {
            test.RuleFor(t => t.Name).NotEmpty().MaximumLength(200);
            test.RuleFor(t => t.ExpectedOutput).NotNull();
        });
    }
}

public sealed class CodeRunRequestValidator : AbstractValidator<CodeRunRequest>
{
    public CodeRunRequestValidator()
    {
        RuleFor(x => x.ExerciseId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(20000);
    }
}

public sealed class SubmitCodeRequestValidator : AbstractValidator<SubmitCodeRequest>
{
    public SubmitCodeRequestValidator()
    {
        RuleFor(x => x.ExerciseId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(20000);
    }
}
